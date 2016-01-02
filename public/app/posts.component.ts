/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
import {Component, OnInit, OnDestroy} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {SocketService} from './services/socket.service.js';
import {AddPostComponent} from './add-post.component.js';
import {Post, Comment} from './services/post.service.js';

@Component({
    templateUrl: "static/views/posts.html",
    selector: 'right-container'
})
export class PostsComponent implements OnInit, OnDestroy {
    socket: SocketIOClient.Socket;
    ch:string;
    commentText:string = "";
    posts:Array<Post> = [];
    
    isAddCommentOpen:boolean = false;
    addCommentText:string = "";
    addCommentImage:string = "";
    
    isAddPostOpen:boolean = false;
    addPostText:string = "";
    addPostImage:string = "";
    
    constructor(
        private _routeParams: RouteParams,
        private _socketService: SocketService){
            
        this.socket = this._socketService.getSocket();
    }
    
    ngOnInit(){
        this.ch = this._routeParams.get('ch');
        
        this.socket.on('new-post', data => {
            this.AddPost(new Post(data.postId, data.text, new Date(data.creationDate),data.image));
        });
        
        this.socket.on('new-comment', data => this.AddComment(data));
        
        this.socket.on('comments', arr => {
            arr.forEach(data=> this.AddComment(data));
        });
        
        this.socket.on('posts', arr => {
            this.posts = [];
            arr.forEach(data => this.AddPost(new Post(data.postId, data.text,new Date(data.creationDate || null),data.image)))
        });
        
        this.socket.on('post-deleted',data=>{
            for (var i = 0; i < this.posts.length; i++) {
                if(this.posts[i].postId == data.id){
                    this.posts.splice(i,1)
                    return;
                }
            }
        })
        
        this.socket.on('comment-deleted', data =>{
            for (var i = 0; i < this.posts.length; i++) {
                var element = this.posts[i];
                if(element.postId == data.postId){
                    for (var j = 0; j < element.comments.length; j++) {
                        var comm = element.comments[j];
                        if(comm.commentId==data.commentId){
                            element.comments.splice(j,1);
                            break;
                        }
                    }
                    return;
                }
            }
        })
        
        this.socket.emit('join',{abbr:this.ch});
        
        Dropzone.options.dzPost = {
            maxFiles: 1,
            maxFilesize: 5,
            addRemoveLinks: true,
            accept: function(file, done) 
            {
                var re = /(?:\.([^.]+))?$/;
                var ext = re.exec(file.name)[1];
                ext = ext.toUpperCase();
                if ( ext == "JPG" || ext == "JPEG" || ext == "PNG" ||  ext == "GIF" ||  ext == "BMP") 
                {
                    done();
                }else { 
                    done("Please select only supported picture files."); 
                }
            },
            success: function(file,response){
                this.addPostImage = response;
            }.bind(this),
            removedfile: function(file,cb){
                this.addPostImage = '';
                $(document).find(file.previewElement).remove();
            }.bind(this)
        }
        
        Dropzone.options.dzComment = {
            maxFiles: 1,
            maxFilesize: 5,
            addRemoveLinks: true,
            accept: function(file, done) 
            {
                var re = /(?:\.([^.]+))?$/;
                var ext = re.exec(file.name)[1];
                ext = ext.toUpperCase();
                if ( ext == "JPG" || ext == "JPEG" || ext == "PNG" ||  ext == "GIF" ||  ext == "BMP") 
                {
                    done();
                }else { 
                    done("Please select only supported picture files."); 
                }
            },
            success: function(file,response){
                this.addCommentImage = response;
            }.bind(this),
            removedfile: function(file,cb){
                this.addCommentImage = '';
                $(document).find(file.previewElement).remove();
            }.bind(this)
        }
        
        var myDz = $("#dzPost").dropzone();
        
        
    }
    
    ngOnDestroy(){
        this.socket.removeAllListeners();
        Dropzone.forElement("#dzPost").destroy();
        this.CloseAll();
    }
    
    public AddComment(data){
        for(var i = 0; i <this.posts.length;i++){
            if(this.posts[i].postId == data.postId){
                //todo create comment instance
                this.posts[i].AddComment(new Comment(data.commentId,data.text, new Date(data.creationDate || null),data.image));
                this.posts.unshift(this.posts[i]);
                this.posts.splice(i+1,1);
                return;
            }
        }
    }
    
    public AddPost(post: Post) {
        if (this.posts.length == 0) {
            this.posts.push(post);
            return;
        }
        this.posts.splice(1, 0, post);
    }
    
    public ToggleComments(post: Post) {
        var newState = !post.areCommentsVisible;
        if(newState){
            this.OpenPostComments(post);
        }
        else{
            this.ClosePostComments(post);
        }
        
        this.commentText = "";
    }
    
    public OpenPostComments(post: Post){
        this.CloseAllComments();
        post.areCommentsVisible = true;
        $('#comment_section_'+post.postId).slideDown();
    }
    
    public ClosePostComments(post: Post){
        this.CloseAddComment();
        this.CloseAllComments();
    }
    
    public CloseAllComments(){
        for (var i = 0; i < this.posts.length; i++) {
            if(this.posts[i].areCommentsVisible){
                this.posts[i].areCommentsVisible = false;
                $('#comment_section_'+this.posts[i].postId).slideUp();
            }
        }
    }
    
    public SendComment(postId:number) {
        if (this.commentText.trim() === "") return;
        this.socket.emit("send-comment",{text:this.commentText,postId:postId,channel:this.ch,image:this.addCommentImage});
        this.commentText="";
    }
    
    public deletePost(id:number){
        this.socket.emit('delete-post',{id:id})
    }
    
    public deleteComment(pid:number,cid:number){
        this.socket.emit('delete-comment',{postId:pid,commentId:cid})
    }
    
    public SendPost(){
        if(this.addPostText.trim()==="")return;
        this.socket.emit("send-post",{channel:this.ch,text:this.addPostText,image:this.addPostImage});
        this.addPostText="";
        this.addPostImage="";
    }
    
    public OpenAddPost(ev:Event){
        ev.stopPropagation();
        this.CloseAddComment();
        this.isAddPostOpen = true;
    }
    public CloseAddPost(){
        this.isAddPostOpen =false;
    }
    public OpenAddComment(ev:Event,id:number){
        ev.stopPropagation();
        if(!this.isAddCommentOpen){
            this.CloseAddPost();
            this.isAddCommentOpen = true;
            this.addCommentId;
            $("#dzComment").dropzone();
        }
    }
    public CloseAddComment(){
        if(this.isAddCommentOpen){
            this.isAddCommentOpen =false;
            Dropzone.forElement("#dzComment").destroy();
        }
    }
    
    public CloseAll(){
        this.CloseAddComment();
        this.CloseAddPost();
    }
    public ImageOnclick(ev:Event){
        ev.stopPropagation();
    }
}