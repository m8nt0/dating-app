// Random life clip swiping algorithm

import { UserId } from "../../domain/value-objects/UserId";

export class ShapeshifterSwipe {
  private readonly userId: UserId;
  private readonly swipeCount: number; // to limit the number of swipes?
//   private readonly swipeHistory: Swipe[];

  constructor(userId: UserId, swipeCount: number) {
    this.userId = userId;
    this.swipeCount = swipeCount;
  }
}