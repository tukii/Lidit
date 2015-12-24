/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from 'angular2/core';
import {SocketService} from './services/socket.service.js';

@Component({
    templateUrl: "static/views/posts.html",
    changeDetection: ChangeDetectionStrategy.CheckAlways
})
export class PostsComponent implements OnInit {
    ch:string;
    posts: Array<Post> = [];
    socket: SocketIOClient.Socket;
    commentText:string = "";
    
    constructor(private _socketService:SocketService, private _ref: ChangeDetectorRef){
        this.AddPost(new Post(0,"BOOM BOOM", [new Comment(5, 2, "Hey guise lel don't go to school tmrw")]));
    }
    
    ngOnInit(){
        this.socket = this._socketService.getSocket();
        this.socket.on('new-post',(data) =>{
            this.AddPost(new Post(data.id, data.text,[]))
            this._ref.markForCheck();
        });
        
        this.socket.on('new-comment',(data) => {
            for(var i = 0; i <this.posts.length;i++){
                if(this.posts[i].id == data.postId){
                    this.posts[i].AddComment(data.text);
                    this._ref.markForCheck();
                    return;
                }
            }
        });
    }
    
    public AddPost(post: Post) {
        if (this.posts.length == 0) {
            this.posts.push(post);
            return;
        }
        this.posts.splice(1, 0, post);
        
    }
    public ToggleComments(post: Post) {
        post.areCommentsVisible = !post.areCommentsVisible;
        for (var i = 0; i < this.posts.length; i++) {
            if (this.posts[i] == post) continue;
            this.posts[i].areCommentsVisible = false;
        }
        this.commentText = "";
    }
    
    public SendComment(postId:number) {
        if (this.commentText.trim() === "") return;
        this.socket.emit("send-comment",{text:this.commentText,postId:postId,channel:"/"});
        this.commentText="";
    }
}

class Post {
    id: number;
    image: string;
    text: string;
    comments: Array<Comment> = [];
    firstComment: Comment;
    areCommentsVisible: boolean;
    typedComment: string = "";
    constructor(id:number, txt: string, comments?: Array<Comment>) {
        this.image = "123";
        this.id = id;
        if (comments.length === 0) {
            this.firstComment = new Comment(0, 0, "No comments...");
        }
        else {
            this.firstComment = comments[0];
        }
        this.areCommentsVisible = false;
        this.text = txt;
        this.comments = comments;
    }
    public AddComment(txt: string) {
        this.comments.push(new Comment(0, 0, txt));
        this.typedComment = "";
    }
}
class CommentState{
    static NONE:number = 0;
    static UPVOTED:number = 1;
    static DOWNVOTED:number = 2;
}
class Comment {
    id: number;
    thumbUps: number;
    thumbDowns: number;
    text: string;
    localState: number = CommentState.NONE; // compare this with CommentState
    
    constructor(ups: number, downs: number, txt: string) {
        this.thumbDowns = downs;
        this.thumbUps = ups;
        this.text = txt;
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