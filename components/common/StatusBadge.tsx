import React from 'react';
import { Badge } from '../ui/badge';
import { RequestStatus } from '../../types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const styles = {
    PENDING: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/20",
    PLAYED: "bg-primary/20 text-primary hover:bg-primary/30 border-primary/20",
    REJECTED: "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20",
  };

  const labels = {
    PENDING: "대기중",
    PLAYED: "재생됨",
    REJECTED: "취소됨",
  };

  return (
    <Badge variant="outline" className={cn(styles[status], "border", className)}>
      {labels[status]}
    </Badge>
  );
};