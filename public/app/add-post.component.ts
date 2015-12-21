import { Component } from 'angular2/core';

@Component({
    selector: 'add-post',
    templateUrl: '/static/views/add-post.html',
    inputs: ['socket']
})
export class AddPostComponent {
    isAddPostOpen:boolean = true;
    addPostText:string = "";
    socket : any;
    
    public SendPost(){
        if(this.addPostText.trim()==="")return;
        
        this.socket.emit("send-post",{text:this.addPostText});
        this.addPostText="";
    }
}
