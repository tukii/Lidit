import { Component, OnInit, Input } from 'angular2/core';
import { RouteParams } from 'angular2/router';

@Component({
    selector: 'add-post',
    templateUrl: '/static/views/add-post.html'
})
export class AddPostComponent {
    isAddPostOpen:boolean = false;
    addPostText:string = "";
    @Input('socket') socket : any;
    @Input('ch') ch: any;
    
    public SendPost(){
        if(this.addPostText.trim()==="")return;
        this.socket.emit("send-post",{channel:this.ch,text:this.addPostText});
        this.addPostText="";
    }
    
    public OpenAddPost(){
        this.isAddPostOpen = true;
    }
}
