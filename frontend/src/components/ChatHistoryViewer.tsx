import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, Info, Bot, User } from 'lucide-react';
import { SymptomCheckResponse } from '@/lib/api';

interface ChatHistoryViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symptomCheck: SymptomCheckResponse | null;
}

export const ChatHistoryViewer: React.FC<ChatHistoryViewerProps> = ({
  open,
  onOpenChange,
  symptomCheck,
}) => {
  if (!symptomCheck) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Emergency': return 'bg-red-500';
      case 'Urgent': return 'bg-orange-500';
      case 'Monitor': return 'bg-yellow-500';
      case 'Low Risk': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Emergency': return AlertCircle;
      case 'Urgent': return Clock;
      case 'Monitor': return Info;
      case 'Low Risk': return CheckCircle;
      default: return Info;
    }
  };

  const RiskIcon = getRiskIcon(symptomCheck.riskLevel);
  const date = new Date(symptomCheck.timestamp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${getRiskColor(symptomCheck.riskLevel)} flex items-center justify-center`}>
              <RiskIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{symptomCheck.riskLevel}</span>
                <Badge variant="outline" className="text-xs">
                  {symptomCheck.category}
                </Badge>
                {symptomCheck.healthSubcategory && (
                  <Badge variant="secondary" className="text-xs">
                    {symptomCheck.healthSubcategory}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-4">
            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-gray-700">{symptomCheck.summary}</p>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            {symptomCheck.messages && symptomCheck.messages.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Conversation</h3>
                  <div className="space-y-4">
                    {symptomCheck.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.type === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-[#FF385C] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Immediate Actions */}
            {symptomCheck.immediateActions && symptomCheck.immediateActions.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#FF385C]" />
                    Immediate Actions
                  </h3>
                  <ul className="space-y-2">
                    {symptomCheck.immediateActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#FF385C] font-bold mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Detailed Sections */}
            {symptomCheck.detailedSections && symptomCheck.detailedSections.length > 0 && (
              <div className="space-y-4">
                {symptomCheck.detailedSections.map((section, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-3">{section.title}</h3>
                      <div className="space-y-2">
                        {section.points.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-2">
                            <span className="text-[#FF385C] font-bold mt-0.5">•</span>
                            <span className="text-sm text-gray-700">{point}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Feedback */}
            {symptomCheck.feedback && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">User Feedback</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={symptomCheck.feedback === 'up' ? 'default' : 'secondary'}>
                      {symptomCheck.feedback === 'up' ? 'Helpful' : 'Not Helpful'}
                    </Badge>
                  </div>
                  {symptomCheck.feedbackReason && (
                    <p className="text-sm text-gray-600 mt-2">
                      Reason: {symptomCheck.feedbackReason}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};