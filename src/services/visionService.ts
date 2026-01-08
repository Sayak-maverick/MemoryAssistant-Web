/**
 * visionService.ts - Google Cloud Vision API integration
 *
 * This service detects objects in images and returns labels
 * for automatic tagging of items.
 *
 * How it works:
 * 1. User uploads an image
 * 2. Image is converted to base64
 * 3. Sent to Google Vision API
 * 4. API returns detected objects with confidence scores
 * 5. We filter and return top labels
 */

import { VISION_API_KEY, VISION_API_URL } from '../config/vision-config';

/**
 * Label detection response from Vision API
 */
export interface VisionLabel {
  description: string;  // Label text (e.g., "Key", "Wallet")
  score: number;       // Confidence score (0-1)
}

/**
 * Detect objects in an image using Google Cloud Vision API
 *
 * @param imageDataUrl - Base64 data URL of the image
 * @returns Array of detected labels sorted by confidence
 */
export async function detectLabels(imageDataUrl: string): Promise<string[]> {
  try {
    // Extract base64 content from data URL
    // Data URL format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    // We need just the base64 part after the comma
    const base64Content = imageDataUrl.split(',')[1];

    if (!base64Content) {
      throw new Error('Invalid image data URL');
    }

    // Prepare the request for Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Content,
          },
          features: [
            {
              type: 'LABEL_DETECTION',  // Detect objects/labels
              maxResults: 10,            // Get top 10 labels
            },
          ],
        },
      ],
    };

    // Call the Vision API
    const response = await fetch(`${VISION_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vision API error:', errorData);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract labels from response
    const labels: VisionLabel[] = data.responses[0]?.labelAnnotations || [];

    // Filter labels with confidence > 0.7 (70%)
    // Convert to lowercase for consistency
    // Remove duplicates
    const filteredLabels = labels
      .filter((label) => label.score > 0.7)
      .map((label) => label.description.toLowerCase())
      .slice(0, 5);  // Take top 5 labels

    return filteredLabels;
  } catch (error) {
    console.error('Error detecting labels:', error);
    // Return empty array on error rather than throwing
    // This way the app continues to work even if Vision API fails
    return [];
  }
}

/**
 * Get suggested item name from detected labels
 *
 * This tries to find the most relevant label for the item name.
 * Priority: specific objects > generic objects
 *
 * @param labels - Array of detected labels
 * @returns Suggested item name
 */
export function suggestItemName(labels: string[]): string {
  if (labels.length === 0) return '';

  // Priority words that make good item names
  const priorityWords = [
    'key', 'wallet', 'phone', 'glasses', 'watch',
    'bag', 'backpack', 'book', 'headphone', 'charger',
    'laptop', 'tablet', 'mouse', 'keyboard', 'camera',
  ];

  // Find first label that matches priority words
  for (const label of labels) {
    for (const word of priorityWords) {
      if (label.includes(word)) {
        // Capitalize first letter
        return label.charAt(0).toUpperCase() + label.slice(1);
      }
    }
  }

  // If no priority match, use first label
  return labels[0].charAt(0).toUpperCase() + labels[0].slice(1);
}
