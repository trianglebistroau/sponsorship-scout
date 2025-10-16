import { CONTENT_TYPES } from "./schema"

export interface S0Output {
  framing: {
    aspect_ratio: string
    safe_zone_compliance: number
    face_box_pct: number
    subject_box_pct: number
  }
  lighting_clarity: {
    avg_brightness: number
    contrast_score: number
    sharpness_score: number
    resolution: string
    stability: boolean
  }
}

export interface S1Output {
  hook_features: {
    face_present: boolean
    text_in_first_3_seconds: boolean
  }
  edit_density: {
    total_cuts: {
      // timestamps: number[];
      count: number
    }
    rotation_changes_per_sec: {
      // timestamps: number[];
      count: number
    }
    effect_density: {
      name: string
      timestamp: number
    }[]
  }
  text_overlay_density: {
    total_overlays: number
    // content_overlays: string[];
    cta_detection: {
      present: boolean
      // timestamps: number[];
    }
  }
  speech_voice: {
    script_extraction: string
    words_per_minute: number
  }
  cta_presence: {
    cta_on_screen: {
      present: boolean
      // timestamps: number[];
    }
    cta_spoken: {
      present: boolean
      // timestamps: number[];
    }
  }
  brand_cues: {
    brand_logo: boolean
    product_category: string
    disclaimer: boolean
  }
}

export interface S2Output {
  setup_background_evaluation: {
    score: number
    category: "Poor" | "Medium" | "Excellent"
  }
  video_quality_evaluation: {
    score: number
    category: "Poor" | "Medium" | "Excellent"
  }
  sound_quality_evaluation: {
    score: number
    category: "Poor" | "Medium" | "Excellent"
  }
  framing_evaluation: {
    score: number
    category: "Poor" | "Medium" | "Excellent"
  }
  overall_score: {
    numeric_score: number
    category: "Poor" | "Medium" | "Excellent"
  }
}

// S3 Output Interface
export type ContentType = (typeof CONTENT_TYPES)[number]

export interface S3Output {
  content_type_primary: ContentType
  confidence_primary: number
  content_type_secondary: ContentType | null
  confidence_secondary: number | null
}


// S4 Recommendations Interface
export interface S4PerVidOutput {
  recommendation: string,
}

export interface S4PerCreatorOutput {
  content_recommendation: string
  profile_recommendation: string
}
