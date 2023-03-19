import { Component } from '@angular/core';
import { PostDTO } from 'src/app/Models/post.dto';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  posts!: PostDTO[];
  totalLikes: number = 0;
  totalDislikes: number = 0;
  totalPosts: number = 0;

  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService
  ) {
    this.loadPosts();
  }

  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    try {
      this.posts = await this.postService.getPosts();
      this.totalPosts = this.posts.length;
      // Calculate the total likes and dislikes
      for (let post of this.posts) {
        this.totalLikes += post.num_likes;
        this.totalDislikes += post.num_dislikes;
      }
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }
}
