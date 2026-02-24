import React, { useState } from 'react';
import { FileText, Send, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
    onTextSubmit: (text: string) => void;
    isLoading?: boolean;
}

export const TextUploader: React.FC<Props> = ({ onTextSubmit, isLoading = false }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (!text.trim()) {
            alert('분석할 텍스트를 입력해주세요.');
            return;
        }
        onTextSubmit(text);
    };

    return (
        <Card className="w-full border-2 border-border/50 bg-background/50 shadow-sm transition-all hover:bg-background/80 hover:border-border">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-primary/10 p-2 md:p-3 rounded-full shrink-0">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-semibold text-foreground tracking-tight">데이터 텍스트 붙여넣기</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">문자, 카카오톡 등으로 받은 간병 내역을 붙여넣으세요.</p>
                    </div>
                </div>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isLoading}
                    placeholder="예) 홍길동 간병인, 김철수 환자, 서울대병원, 10/1~10/5..."
                    className="w-full min-h-[120px] mb-5 text-sm md:text-base font-normal resize-none focus-visible:ring-primary focus-visible:ring-offset-2 transition-all shadow-sm"
                />

                <div className="flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !text.trim()}
                        className="w-full md:w-auto h-11 px-6 font-medium shadow-sm"
                        size="default"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="mr-2 shrink-0 animate-spin" />
                        ) : (
                            <Send size={16} className="mr-2 shrink-0" />
                        )}
                        AI 데이터 추출 시작
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
