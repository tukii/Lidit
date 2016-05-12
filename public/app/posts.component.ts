/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
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
            this.AddPost(data);
        });
        
        this.socket.on('new-comment', data => this.AddComment(data));
        
        this.socket.on('posts', arr => {
            this.posts = [];
            arr.forEach(data => this.AddPost(data))
        });
        
        this.socket.on('post-deleted',data=>{
            for (var i = 0; i < this.posts.length; i++) {
                if(this.posts[i].id == data.id){
                    this.posts.splice(i,1)
                    return;
                }
            }
        })
        
        this.socket.on('comment-deleted', data =>{
            for (var i = 0; i < this.posts.length; i++) {
                var element = this.posts[i];
                if(element.id == data.postId){
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
        
        this.socket.on('upvoted',id=>{
            this.GetPostOrCommentWithId(id).upvotes++
        })
        
        this.socket.on('downvoted',id=>{
            this.GetPostOrCommentWithId(id).downvotes++
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
            if(this.posts[i].id == data.postId){
                this.posts[i].AddComment(data);
                this.posts.unshift(this.posts[i])
                this.posts.splice(i+1,1)
                return;
            }
        }
    }
    
    public AddPost(data:any) :void{
        var post:Post = new Post(data.postId, data.text, new Date(data.creationDate || null),data.image,data.comments || [],data.upvotes,data.downvotes,data.myVote)
        for(var i=0; i<this.posts.length;i++){
            if(this.posts[i].lastActivity < post.lastActivity){
                this.posts.splice(i, 0, post)
                return
            }
        }
        this.posts.push(post)
    }
    
    public GetPostWithId(id:number): Post{
        for(var i=0; i<this.posts.length; i++){
            if(this.posts[i].id === id){
                return this.posts[i]; 
            }
        }
        return null;
    }
    public GetPostOrCommentWithId(id:number): any{
        for(var i=0; i<this.posts.length; i++){
            if(this.posts[i].id === id){
                return this.posts[i]; 
            }
            for(var j=0; j<this.posts[i].comments.length; j++){
                var com = this.posts[i].comments[j];
                if(com.commentId == id){
                    return com;
                }
            }
        }
        return null;
    }
    
    
    public ToggleComments(post: Post) {
        var newState = !post.areCommentsVisible;
        if(newState){
            this.OpenPostComments(post);
        }
        else{
            this.ClosePostComments(post);
        }
        
        this.addCommentText = "";
    }
    
    public OpenPostComments(post: Post){
        this.CloseAllComments();
        post.areCommentsVisible = true;
        $('#comment_section_'+post.id).slideDown();
    }
    
    public ClosePostComments(post: Post){
        this.CloseAddComment();
        this.CloseAllComments();
    }
    
    public CloseAllComments(){
        for (var i = 0; i < this.posts.length; i++) {
            if(this.posts[i].areCommentsVisible){
                this.posts[i].areCommentsVisible = false;
                $('#comment_section_'+this.posts[i].id).slideUp();
            }
        }
    }
    
    public SendComment(postId:number) {
        if (this.addCommentText.trim() === "") return;
        this.socket.emit("send-comment",{text:this.addCommentText,postId:postId,channel:this.ch,image:this.addCommentImage});
        this.addCommentText="";
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
    public OpenAddComment(ev:Event){
        ev.stopPropagation();
        if(!this.isAddCommentOpen){
            this.CloseAddPost();
            this.isAddCommentOpen = true;
            $("#dzComment").dropzone();
        }
    }
    public CloseAddComment(){
        if(this.isAddCommentOpen){
            this.isAddCommentOpen =false;
            Dropzone.forElement("#dzComment").destroy();
        }
    }
    
    public toggleExpand(ev){
        if($(ev.target).hasClass('img-expand')){
            $(ev.target).removeClass('img-expand');
        }
        else{
            $(ev.target).addClass('img-expand');
        }
    }
    
    public CloseAll(){
        this.CloseAddComment();
        this.CloseAddPost();
    }
    public ImageOnclick(ev:Event){
        ev.stopPropagation();
    }
    
    public Upvote(id:number){
        var p = this.GetPostOrCommentWithId(id)
        if(p.CanVote){
            p.Upvote()
            this.socket.emit('upvote',{id:id, channel:this.ch}, function(error){
                if(error)
                    p.DisableVote()
            })
        }
    }
    
    public Downvote(id:number){
        var p = this.GetPostOrCommentWithId(id)
        if(p.CanVote){
            p.Downvote()
            this.socket.emit('downvote',{id:id, channel: this.ch}, function(error){
                if(error)
                    p.DisableVote()
            })
        }
    }
    
    public AddReply(post,ev){
        ev.stopPropagation()
        if(typeof post.areCommentsVisible !== "undefined" && !post.areCommentsVisible){
            this.OpenPostComments(post)
            setTimeout(()=>{
                this.addCommentText += "@"+post.prettyId+'\n'
                this.OpenAddComment(ev)
            },500)
        }
        else {
            this.addCommentText += "@"+post.prettyId+'\n'
            this.OpenAddComment(ev)
        }
        
    }
}