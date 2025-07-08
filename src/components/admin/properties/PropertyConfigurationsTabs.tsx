"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Home, Ruler, Bath, Bed, Calendar } from 'lucide-react';

interface PropertyConfiguration {
  bhk: number;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor_plan_url?: string;
  brochure_url?: string;
  ready_by?: string;
}

interface PropertyConfigurationsTabsProps {
  configurations: PropertyConfiguration[];
}

export default function PropertyConfigurationsTabs({ configurations }: PropertyConfigurationsTabsProps) {
  if (!configurations || configurations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No configurations available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={String(configurations[0].bhk)} className="w-full">
          <TabsList className="mb-4">
            {configurations.map((config, idx) => (
              <TabsTrigger key={idx} value={String(config.bhk)}>
                {config.bhk} BHK
              </TabsTrigger>
            ))}
          </TabsList>
          {configurations.map((config, idx) => (
            <TabsContent key={idx} value={String(config.bhk)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">BHK:</span>
                    <span className="text-base font-semibold">{config.bhk}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Area:</span>
                    <span className="text-base font-semibold">{config.area.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bedrooms:</span>
                    <span className="text-base font-semibold">{config.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bathrooms:</span>
                    <span className="text-base font-semibold">{config.bathrooms}</span>
                  </div>
                  {config.ready_by && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Ready By:</span>
                      <span className="text-base font-semibold">{config.ready_by}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Price:</span>
                    <div className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(config.price)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    {config.floor_plan_url && (
                      <Button asChild variant="outline" size="sm" className="w-fit">
                        <a href={config.floor_plan_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Floor Plan
                        </a>
                      </Button>
                    )}
                    {config.brochure_url && (
                      <Button asChild variant="outline" size="sm" className="w-fit">
                        <a href={config.brochure_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download Brochure
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 