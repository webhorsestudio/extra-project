'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, ExternalLink } from 'lucide-react';

interface PropertyAgentInfoProps {
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  agentRole?: string;
  agentAvatar?: string;
  postedBy?: string;
  createdBy?: string;
}

export default function PropertyAgentInfo({ 
  agentId, 
  agentName, 
  agentEmail, 
  agentPhone, 
  agentRole, 
  agentAvatar,
  postedBy,
  createdBy 
}: PropertyAgentInfoProps) {
  const hasAgentInfo = agentName || agentEmail || agentPhone;
  const displayName = agentName || postedBy || createdBy || 'Unknown Agent';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Agent Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAgentInfo ? (
          <div className="space-y-4">
            {/* Agent Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={agentAvatar} alt={displayName} />
                <AvatarFallback className="text-lg">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{displayName}</h3>
                {agentRole && (
                  <Badge variant="secondary" className="mt-1">
                    {agentRole}
                  </Badge>
                )}
                {agentId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Agent ID: {agentId}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              {agentEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{agentEmail}</span>
                </div>
              )}
              {agentPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{agentPhone}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              {agentEmail && (
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${agentEmail}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </a>
                </Button>
              )}
              {agentId && (
                <Button asChild variant="outline" size="sm">
                  <a href={`/admin/users/${agentId}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No agent information available</p>
            {postedBy && (
              <p className="text-sm mt-2">
                Posted by: <span className="font-medium">{postedBy}</span>
              </p>
            )}
            {createdBy && (
              <p className="text-sm mt-1">
                Created by: <span className="font-medium">{createdBy}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 