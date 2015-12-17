import {Component} from 'angular2/core';
interface Hero {
    id: number;
    name: string;
}
@Component({
    selector: 'my-app',
    templateUrl: 'views/main.html'
})
export class AppComponent {
    words: Array<Word>;
    channels: Array<Channel>;
    typedWord: string;
    showDescription: boolean;
    availableTags: Array<string> = ["123"];

    constructor() {
        this.words = [];
        this.AddWord(new Word("Bicycle", [new Description(5, 2, "Transport vehicle with 2 tires."), new Description(10, 2, "fake fake fake"), new Description(0, 7, "nonsense!!!")]));
        this.AddWord(new Word("Arrow", [new Description(5, 2, "A geometrical object used to denote a direction or point to a certain thing.")]));
        this.AddWord(new Word("Cloud", [new Description(5, 2, "Clouds are white.")]));
        this.typedWord = "";
        this.showDescription = false;
        
        this.channels = [new Channel("random","b"), new Channel("anime","a"),new Channel("music","m")];
        
        /*
        $("#searchBox").autocomplete({
            source: this.availableTags
        }); */ // have to see what to do with this
    }
    public WordEntered($event: any) {
        if ($event.which == 13) {
            for (var i = 0; i < this.words.length; i++) {
                if (this.words[i].text === this.typedWord) return;
            }
            this.AddNewWord(this.typedWord);
            this.typedWord = "";
        }
    }
    public AddNewWord(word: string) {
        this.AddWord(new Word(word, []));
    }
    public AddWord(word: Word) {
        if (this.words.length == 0) {
            this.words.push(word);
            this.availableTags.push(word.text);
            return;
        }
        for (var i = 0; i < this.words.length; i++) {
            if (this.words[i].text.localeCompare(word.text) > 0) {
                this.words.splice(i, 0, word);
                this.availableTags.splice(i, 0, word.text);
                return;
            }
        }
        this.words.push(word);
    }
    public ToggleDescs(word: Word) {
        word.areDescsVisible = !word.areDescsVisible;
        for (var i = 0; i < this.words.length; i++) {
            if (this.words[i] == word) continue;
            this.words[i].areDescsVisible = false;
        }
    }
}

class Channel {
    Name:string;
    Abbrevation:string;
    constructor(name:string, abbrevation:string) {
        this.Name = name;
        this.Abbrevation = abbrevation;
    }
}

class Word {
    text: string;
    descriptions: Array<Description>;
    firstDescription: Description;
    areDescsVisible: boolean;
    typedDescription: string = "";
    constructor(txt: string, descs: Array<Description>) {
        if (descs.length == 0) {
            this.firstDescription = new Description(0, 0, "No description available... Write one yourself!");
        }
        else {
            this.firstDescription = descs[0];
        }
        this.areDescsVisible = false;
        this.text = txt;
        this.descriptions = descs;
    }
    public AddDescription(txt: string) {
        console.log("clicked_" + txt);
        this.descriptions.push(new Description(0, 0, txt));
        this.typedDescription = "";
    }
    public AddTypedDescription() {
        if (this.typedDescription.trim() == "") return;
        this.descriptions.push(new Description(0, 0, this.typedDescription));
        this.typedDescription = "";
    }
    public ButtonPressed($event: any) {
        if ($event.which == 13) {
            this.AddTypedDescription();
        }
    }
}
class Description {
    thumbUps: number;
    thumbDowns: number;
    downvoted: boolean;
    upvoted: boolean;

    public set Upvoted(b: boolean) {
        if (b == true) this.downvoted = false;
        this.upvoted = b;
    }
    public set Downvoted(b: boolean) {
        if (b == true) this.upvoted = false;
        this.downvoted = b;
    }


    text: string;
    constructor(ups: number, downs: number, txt: string) {
        this.thumbDowns = downs;
        this.thumbUps = ups;
        this.text = txt;
        this.Upvoted = false;
        this.Downvoted = false;
    }
    public Value(): number {
        return this.thumbUps - this.thumbDowns;
    }

    public ToggleUpvote() {
        this.Upvoted = !this.upvoted;
    }
    public ToggleDownvote() {
        this.Downvoted = !this.downvoted;
    }
}
var HEROES: Hero[] = [
    { "id": 11, "name": "Mr. Nice" },
    { "id": 12, "name": "Narco" },
    { "id": 13, "name": "Bombasto" },
    { "id": 14, "name": "Celeritas" },
    { "id": 15, "name": "Magneta" },
    { "id": 16, "name": "RubberMan" },
    { "id": 17, "name": "Dynama" },
    { "id": 18, "name": "Dr IQ" },
    { "id": 19, "name": "Magma" },
    { "id": 20, "name": "Tornado" }
];