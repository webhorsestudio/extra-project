import { toast } from '@/components/ui/use-toast';

interface ShareData {
  title: string;
  text: string;
  url: string;
  propertyId?: string;
}

export const shareProperty = async (data: ShareData) => {
  const { title, text, url, propertyId } = data;

  try {
    // Try native Web Share API first
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
      toast({
        title: "Shared successfully!",
        description: "Property has been shared.",
      });
      return true;
    }
  } catch (error) {
    // User cancelled or share failed, continue to fallback
    console.log('Native share cancelled or failed:', error);
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${url}`);
    toast({
      title: "Link copied to clipboard",
      description: "Property link has been copied to your clipboard.",
    });
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Final fallback: Show URL in alert
    alert(`${title}\n\n${text}\n\n${url}`);
    toast({
      title: "Share information displayed",
      description: "Property information has been displayed.",
    });
    return true;
  }
};

export const shareToWhatsApp = (data: ShareData) => {
  const { title, text, url } = data;
  const whatsappText = encodeURIComponent(`${title}\n\n${text}\n\n${url}`);
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
  
  try {
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Opening WhatsApp",
      description: "Property link is ready to share on WhatsApp.",
    });
  } catch (error) {
    console.error('Failed to open WhatsApp:', error);
    toast({
      title: "Error",
      description: "Failed to open WhatsApp. Please try again.",
      variant: "destructive"
    });
  }
};

export const copyToClipboard = async (text: string, successMessage = "Copied to clipboard") => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: successMessage,
      description: "The content has been copied to your clipboard.",
    });
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast({
      title: "Copy failed",
      description: "Failed to copy to clipboard. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const generatePropertyShareData = (property: any, baseUrl?: string): ShareData => {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const config = property.property_configurations?.[0];
  const beds = config?.bedrooms || config?.bhk || '';
  const price = config?.price ? `₹${config.price.toLocaleString()}` : '';
  
  return {
    title: property.title || 'Property',
    text: `Check out this amazing property${beds ? ` (${beds} BHK)` : ''}${price ? ` for ${price}` : ''} in ${property.property_locations?.name || property.location || 'Mumbai'}.`,
    url,
    propertyId: property.id
  };
}; 