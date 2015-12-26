export class Post {
    postId: number;
    creationDate: Date = new Date();
    image: string;
    text: string;
    comments: Array<Comment> = [];
    areCommentsVisible: boolean;
    typedComment: string = "";
    thumbUps: number = 0;
    thumbDowns: number = 0;
    constructor(id:number, txt: string, comments?: Array<Comment>) {
        this.image = "123";
        this.postId = id;
        
        this.areCommentsVisible = false;
        this.text = txt;
        this.comments = comments;
    }
    public AddComment(com: Comment) {
        this.comments.push(com);
        this.typedComment = "";
    }
    
    public get prettyId():string{
        return pretifyId(this.postId);
    }
}
export class CommentState{
    static NONE:number = 0;
    static UPVOTED:number = 1;
    static DOWNVOTED:number = 2;
}
export class Comment {
    commentId: number;
    thumbUps: number = 0;
    thumbDowns: number = 0;
    creationDate: Date = new Date();
    text: string;
    localState: number = CommentState.NONE;
    
    constructor(id:number,txt: string /*ups: number, downs: number,*/ ) {
        //this.thumbDowns = downs;
        //this.thumbUps = ups;
        this.commentId = id;
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
    
    public get prettyId():string{
        return pretifyId(this.commentId);
    }
}

function pretifyId(id:number):string{
    var str:string = String(id);
        while(str.length<8)
            str = '0' + str;
        return str;
}