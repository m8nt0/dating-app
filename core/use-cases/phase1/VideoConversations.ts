// Real-time Video chat rooms

import { UserId } from "../../domain/value-objects/UserId";

export class VideoChat {
  private readonly userId: UserId;
  private readonly videoChatHistory: VideoChat[];

  constructor(userId: UserId, videoChatHistory: VideoChat[]) {
    this.userId = userId;
    this.videoChatHistory = videoChatHistory;
  }
}