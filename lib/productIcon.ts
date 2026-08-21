import { Ionicons } from '@expo/vector-icons';

import { ProductCategory } from '@/data/mock';

export const CATEGORY_ICON: Record<ProductCategory, keyof typeof Ionicons.glyphMap> = {
  skincare: 'flower-outline',
  vitamin: 'nutrition-outline',
  supplement: 'leaf-outline',
  ampoule: 'flask-outline',
};
