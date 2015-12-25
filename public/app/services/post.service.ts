export class Post {
    postId: number;
    image: string;
    text: string;
    comments: Array<Comment> = [];
    areCommentsVisible: boolean;
    typedComment: string = "";
    constructor(id:number, txt: string, comments?: Array<Comment>) {
        this.image = "123";
        this.postId = id;
        
        this.areCommentsVisible = false;
        this.text = txt;
        this.comments = comments;
    }
    public AddComment(txt: string) {
        this.comments.push(new Comment(0,txt));
        this.typedComment = "";
    }
}
export class CommentState{
    static NONE:number = 0;
    static UPVOTED:number = 1;
    static DOWNVOTED:number = 2;
}
export class Comment {
    commentId: number;
    thumbUps: number;
    thumbDowns: number;
    text: string;
    localState: number = CommentState.NONE;
    
    constructor(id:number,txt: string /*ups: number, downs: number,*/ ) {
        //this.thumbDowns = downs;
        //this.thumbUps = ups;
        this.text = txt;
        this.commentId =id;
    }
    
    public get isUpvoted() : boolean {
        return this.localState === CommentState.UPVOTED;
    }
    
    public get isDownvoted() : boolean {
        return this.localState === CommentState.DOWNVOTED;
    }
    
    public ToggleUpvote() : void{
        //TODO send message to the server
        this.localState = CommentState.UPVOTED;
    }
    
    public ToggleDownvote() : void{
        //TODO send message to the server
        this.localState = CommentState.DOWNVOTED;
    }
        
    public Value(): number {
        return this.thumbUps - this.thumbDowns;
    }
}