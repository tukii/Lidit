import * as m from './../../node_modules/marked/lib/marked.js';
var marked = m.parse;

abstract class Votable {
    upvotes: number = 0;
    downvotes: number = 0;
    localState: number = CommentState.NONE;
    
    constructor(myVote:any){
        this.upvotes=0;
        this.downvotes=0;
        this.localState = typeof myVote === "undefined"?
                            CommentState.NONE:
                            myVote == '+'?
                                CommentState.UPVOTED:
                                CommentState.DOWNVOTED;
    }
    
    public get isUpvoted() : boolean {
        return this.localState === CommentState.UPVOTED;
    }
    
    public get isDownvoted() : boolean {
        return this.localState === CommentState.DOWNVOTED;
    }
    
    public get CanVote(): boolean {
        return !(this.isUpvoted || this.isDownvoted) 
    }
    
    public DisableVote(): void{
        if(this.isUpvoted){
            this.upvotes--
        }
        else if(this.isDownvoted){
            this.downvotes--   
        }
        this.localState = CommentState.NONE;
    }
    
    public Upvote() : void{
        this.upvotes++;
        this.localState = CommentState.UPVOTED;
    }
    
    public Downvote() : void{
        this.downvotes++;
        this.localState = CommentState.DOWNVOTED;
    }
    
    public VoteValue(): number {
        return this.upvotes - this.downvotes;
    }
}

export class Post extends Votable {
    text: string;
    imagePath: string;
    imageName: string;
    comments: Array<Comment> = [];
    areCommentsVisible: boolean = false;
    typedComment: string = "";
    constructor(
        public postId:number, 
        text: string,
        public creationDate:Date,
        image:string,
        rawComments:Array<any>,
        upvotes:number = 0,
        downvotes:number = 0,
        myVote:any) {
        super(myVote)
        this.downvotes = downvotes
        this.upvotes = upvotes
        if(typeof image !== "undefined" && image.trim()!==""){
            this.imagePath = "static/uploads/"+image;
            this.imageName = image.substring(image.lastIndexOf(']')+1);
        }
        rawComments.forEach(com=>{
            this.AddComment(com);
        })
        
        this.text = tryEmbed(marked(text));
        
        this.areCommentsVisible = false;
    }
    public AddComment(data:any) {
        var com = new Comment(data.commentId,data.text, new Date(data.creationDate || null),data.image,data.upvotes,data.downvotes,data.myVote)
        this.comments.push(com);
    }
    
    public get prettyId():string{
        return pretifyId(this.postId);
    }
    
    public get lastActivity():Date{
        var max = this.creationDate;
        this.comments.forEach(com=>{
            if(max < com.creationDate)
                max=com.creationDate;
        })
        return max;
    }
}
export class CommentState{
    static NONE:number = 0;
    static UPVOTED:number = 1;
    static DOWNVOTED:number = 2;
}
export class Comment extends Votable{
    imagePath: string;
    imageName: string;
    commentId: number;
    text: string;
    
    constructor(id:number,txt: string, public creationDate:Date,image:string,upvotes:number=0,downvotes:number=0,myVote:any) {
        super(myVote)
        this.upvotes=upvotes;
        this.downvotes = downvotes;
        if(typeof image !== "undefined" && image.trim()!==""){
            this.imagePath = "static/uploads/"+image;
            this.imageName = image.substring(image.lastIndexOf(']')+1);
        }
        this.commentId = id;
        this.text = tryEmbed(marked(txt));
        this.commentId =id;
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

function tryEmbed(text) {
    var regExp = /https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(&(amp;)?[\w\?=]*)?/;
    var match = text.match(regExp);

    if (match && match[1].length == 11) {
        return text +'\n'+ CreateYTEmbed(match[1])
    } else {
        regExp = /https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|)/;
        match = text.match(regExp);

        if (match) {
            return text +'\n'+ CreateVimEmbed(match[1])
        } else {
            return text
        }
    }
}

function CreateVimEmbed(id){
    return`
    <iframe src="https://player.vimeo.com/video/${id}?byline=0" width="500" height="281" 
        frameborder="0"
        allowfullscreen>
    </iframe>`
}

function CreateYTEmbed(id){
    return `
        <iframe width="420" height="315" 
            src="http://www.youtube.com/embed/${id}" 
            frameborder="0" 
            allowfullscreen>
        </iframe>
    `
}