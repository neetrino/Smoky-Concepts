export interface VotingSummary {
  id: string;
  title: string;
  published: boolean;
  itemCount: number;
  totalLikes: number;
  items: VotingSummaryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface VotingListResponse {
  data: VotingSummary[];
}

export interface VotingSummaryItem {
  id: string;
  title: string;
  imageUrl: string;
  galleryUrls: string[];
  productSlug?: string | null;
  likeCount: number;
}

export interface VotingDetail {
  id: string;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VotingItem {
  id: string;
  votingId: string;
  title: string;
  imageUrl: string;
  galleryUrls: string[];
  productSlug?: string | null;
  likeCount: number;
  topLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VotingWithItemsResponse {
  data: {
    voting: VotingDetail;
    items: VotingItem[];
  };
  meta?: {
    totalItems: number;
    totalLikes: number;
    topLikedId: string | null;
  };
}

export interface VotingFormData {
  title: string;
  imageUrls: string[];
  /** Storefront product slug for home Culture early-access checkout */
  productSlug: string;
}

export interface VotingCampaignFormData {
  title: string;
}
