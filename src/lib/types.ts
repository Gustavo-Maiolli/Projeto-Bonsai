export interface Profile {
  id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Plant {
  id: string
  user_id: string
  species: string
  nickname: string | null
  location: string | null
  temperature: string | null
  start_date: string
  watering_frequency: number
  sun_frequency: number | null
  care_notes: string | null
  image_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Post {
  id: string
  plant_id: string
  user_id: string
  image_url: string
  description: string | null
  created_at: string
  updated_at: string
  plants?: Plant
  profiles?: Profile
  likes?: Like[]
  comments?: Comment[]
  _count?: {
    likes: number
    comments: number
  }
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface CareReminder {
  id: string
  plant_id: string
  user_id: string
  reminder_date: string
  reminder_type: "watering" | "sun"
  completed: boolean
  completed_at: string | null
  created_at: string
  plants?: Plant
}
