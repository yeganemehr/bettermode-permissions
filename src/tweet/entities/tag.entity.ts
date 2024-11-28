import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
// I know it's a empty Entity but most probebly in a real project, we should store some other data for each tag, such as NSFW tag or non-searchable tags
export class Tag {
  @PrimaryColumn({
    length: 30, // Based on real-world limits of X, according to Google
  })
  id: string;
}
