import { Type } from "@google/genai"

export const S0Schema = {
  type: Type.OBJECT,
  properties: {
    framing: {
      type: Type.OBJECT,
      properties: {
        aspect_ratio: {
          type: Type.STRING,
          description: "The video's aspect ratio (e.g., 9:16)",
        },
        safe_zone_compliance: {
          type: Type.INTEGER,
          description:
            "Percentage of subject within TikTok safe zone (top 126px, bottom 320px, left 60px, right 120px)",
        },
        face_box_pct: {
          type: Type.INTEGER,
          description: "Percentage of frame occupied by face",
        },
        subject_box_pct: {
          type: Type.INTEGER,
          description: "Percentage of frame occupied by main object",
        },
      },
      required: [
        "aspect_ratio",
        "safe_zone_compliance",
        "face_box_pct",
        "subject_box_pct",
      ],
    },
    lighting_clarity: {
      type: Type.OBJECT,
      properties: {
        avg_brightness: {
          type: Type.INTEGER,
          description: "Average pixel brightness (0-255)",
        },
        contrast_score: {
          type: Type.INTEGER,
          description: "Pixel intensity standard deviation",
        },
        sharpness_score: {
          type: Type.NUMBER,
          description: "Laplacian variance for blur detection (0-1)",
        },
        resolution: {
          type: Type.STRING,
          description: "Video resolution (e.g., 1280x720)",
        },
        stability: {
          type: Type.BOOLEAN,
          description: "Whether the video is shaky",
        },
      },
      required: [
        "avg_brightness",
        "contrast_score",
        "sharpness_score",
        "resolution",
        "stability",
      ],
    },
  },
  required: ["framing", "lighting_clarity"],
}

export const S1Schema = {
  type: Type.OBJECT,
  properties: {
    hook_features: {
      type: Type.OBJECT,
      properties: {
        face_present: {
          type: Type.BOOLEAN,
          description: "Detect whether a human face is in the video.",
        },
        text_in_first_3_seconds: {
          type: Type.BOOLEAN,
          description: "Detect if text appears in the first 3 seconds.",
        },
      },
      required: ["face_present", "text_in_first_3_seconds"],
    },
    edit_density: {
      type: Type.OBJECT,
      properties: {
        total_cuts: {
          type: Type.OBJECT,
          properties: {
            // timestamps: {
            //   type: Type.ARRAY,
            //   items: { type: Type.NUMBER },
            //   description: "Timestamps when each cut happens.",
            // },
            count: {
              type: Type.INTEGER,
              description: "Count of cuts.",
            },
          },
          required: ["count"], // "timestamps"
        },
        rotation_changes_per_sec: {
          type: Type.OBJECT,
          properties: {
            // timestamps: {
            //   type: Type.ARRAY,
            //   items: { type: Type.NUMBER },
            //   description: "Timestamps when each rotation happens.",
            // },
            count: {
              type: Type.NUMBER,
              description: "Count of rotations per second.",
            },
          },
          required: ["count"], //"timestamps"
        },
        // effect_density: {
        //   type: Type.ARRAY,
        //   items: {
        //     type: Type.OBJECT,
        //     properties: {
        //       name: { type: Type.STRING, description: "Name of the visual effect." },
        //       timestamp: { type: Type.NUMBER, description: "Timestamp of the effect." },
        //     },
        //     required: ["name", "timestamp"],
        //   },
        //   description: "List of visual effects with their names and timestamps.",
        // },
      },
      required: ["total_cuts", "rotation_changes_per_sec"], //, "effect_density"],
    },
    text_overlay_density: {
      type: Type.OBJECT,
      properties: {
        total_overlays: {
          type: Type.INTEGER,
          description: "Count of distinct texts that appear in the video.",
        },
        // content_overlays: {
        //   type: Type.ARRAY,
        //   items: { type: Type.STRING },
        //   description: "List of actual text strings that appear.",
        // },
        cta_detection: {
          type: Type.OBJECT,
          properties: {
            present: {
              type: Type.BOOLEAN,
              description: "Whether calls to action are detected.",
            },
            // timestamps: {
            //   type: Type.ARRAY,
            //   items: { type: Type.NUMBER },
            //   description: "Timestamps when CTAs are detected.",
            // },
          },
          required: ["present"], // "timestamps"],
        },
      },
      required: ["total_overlays", "cta_detection"], //"content_overlays"
    },
    speech_voice: {
      type: Type.OBJECT,
      properties: {
        script_extraction: {
          type: Type.STRING,
          description: "Extracted spoken script of the video (voice only).",
        },
        words_per_minute: {
          type: Type.NUMBER,
          description: "Speech rate in words per minute.",
        },
      },
      required: ["script_extraction", "words_per_minute"],
    },
    cta_presence: {
      type: Type.OBJECT,
      properties: {
        cta_on_screen: {
          type: Type.OBJECT,
          properties: {
            present: {
              type: Type.BOOLEAN,
              description: "Whether CTA text appears on screen.",
            },
            timestamps: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Timestamps when CTA text appears on screen.",
            },
          },
          required: ["present", "timestamps"],
        },
        cta_spoken: {
          type: Type.OBJECT,
          properties: {
            present: {
              type: Type.BOOLEAN,
              description: "Whether CTA is spoken in voiceover.",
            },
            timestamps: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Timestamps when CTA is spoken in voiceover.",
            },
          },
          required: ["present", "timestamps"],
        },
      },
      required: ["cta_on_screen", "cta_spoken"],
    },
    brand_cues: {
      type: Type.OBJECT,
      properties: {
        brand_logo: {
          type: Type.BOOLEAN,
          description: "Whether a brand logo appears.",
        },
        product_category: {
          type: Type.STRING,
          description: "Category of product shown (e.g., beauty, food, tech).",
        },
        disclaimer: {
          type: Type.BOOLEAN,
          description: "Whether disclaimer text is present (e.g., #ad).",
        },
      },
      required: ["brand_logo", "product_category", "disclaimer"],
    },
  },
  required: [
    "hook_features",
    "edit_density",
    "text_overlay_density",
    "speech_voice",
    "cta_presence",
    "brand_cues",
  ],
}

export const S2Schema = {
  type: Type.OBJECT,
  properties: {
    setup_background_evaluation: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description:
            "Numeric score for Setup/Background (1=Poor, 2=Medium, 3=Excellent)",
        },
        category: {
          type: Type.STRING,
          description:
            "Categorical score for Setup/Background (Poor, Medium, Excellent)",
        },
      },
      required: ["score", "category"],
    },
    video_quality_evaluation: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description:
            "Numeric score for Video Quality (1=Poor, 2=Medium, 3=Excellent)",
        },
        category: {
          type: Type.STRING,
          description:
            "Categorical score for Video Quality (Poor, Medium, Excellent)",
        },
      },
      required: ["score", "category"],
    },
    sound_quality_evaluation: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description:
            "Numeric score for Sound Quality (1=Poor, 2=Medium, 3=Excellent)",
        },
        category: {
          type: Type.STRING,
          description:
            "Categorical score for Sound Quality (Poor, Medium, Excellent)",
        },
      },
      required: ["score", "category"],
    },
    framing_evaluation: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description:
            "Numeric score for Framing (1=Poor, 2=Medium, 3=Excellent)",
        },
        category: {
          type: Type.STRING,
          description:
            "Categorical score for Framing (Poor, Medium, Excellent)",
        },
      },
      required: ["score", "category"],
    },
    overall_score: {
      type: Type.OBJECT,
      properties: {
        numeric_score: {
          type: Type.NUMBER,
          description: "Weighted aggregated numeric score (1.0-3.0)",
        },
        category: {
          type: Type.STRING,
          description: "Overall categorical score (Poor, Medium, Excellent)",
        },
      },
      required: ["numeric_score", "category"],
    },
  },
  required: [
    "setup_background_evaluation",
    "video_quality_evaluation",
    "sound_quality_evaluation",
    "framing_evaluation",
    "overall_score",
  ],
}

export const CONTENT_TYPES = [
  "Outfit Tutorials",
  "Lookbooks / Seasonal Collections",
  "Transformation / Before–After",
  "Fashion Hacks / Quick Tips",
  "Brand Collabs / Sponsored",
  "Trends / Viral Challenges",
  "Behind-the-Scenes / Daily Fashion Vlogs",
  "Humor / Entertainer",
  "Relatable / Storytime",
] as const

export const S3Schema = {
  type: Type.OBJECT,
  properties: {
    // video_id: { type: Type.STRING },
    content_type_primary: { type: Type.STRING, enum: CONTENT_TYPES },
    confidence_primary: { type: Type.NUMBER },
    content_type_secondary: {
      type: Type.STRING,
      enum: CONTENT_TYPES,
      nullable: true,
    },
    confidence_secondary: { type: Type.NUMBER, nullable: true },
  },
  required: ["video_id", "content_type_primary", "confidence_primary"],
}
