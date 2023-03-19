import { Pipe, PipeTransform } from '@angular/core';
import { PostDTO } from '../Models/post.dto';

@Pipe({
  name: 'postFilter',
})
export class PostFilterPipe implements PipeTransform {
  transform(posts: PostDTO[], userAlias: string): PostDTO[] {
    if (!userAlias || userAlias === '') {
      return posts;
    }
    return posts.filter((post) =>
      post.userAlias.toLowerCase().includes(userAlias.toLowerCase())
    );
  }
}
