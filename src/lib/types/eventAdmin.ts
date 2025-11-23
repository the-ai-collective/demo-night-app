export type EventAdmin = {
  id: string;
  name: string;
  date: Date;
  url: string;
  config: any;
  secret: string;
  _count: {
    demos: number;
    attendees: number;
  };
  chapterId: string | null;
};

export default EventAdmin;
