/**
 * Essay is a list of paragraphs
 */
export class Essay {
    paragraphs:Paragraph[];
    tokens:Token[];
    words:Token[];
    sentences:Sentence[];
    constructor(st:string, options?:TokenOptions){
        this.tokens=new Tokenizer(st).tokenize(options);
        this.words=this.tokens.filter(k=>k.type==Token.Word);
        this.paragraphs=new EssayParser(this.tokens).parse();
        this.sentences=[];
        this.paragraphs.forEach(p=>{
            p.sentences.forEach(s=>{
                this.sentences.push(s);
            })
        })
    }
}

/**
 * Paragraph is a list of sentences
 */
class Paragraph {
    sentences:Sentence[];
    constructor(sentences:Sentence[]){
        this.sentences=sentences;
    }
}

/**
 * Sentence is a list of tokens
 */
class Sentence {
    tokens:Token[];
    words:Token[];
    constructor(tokens:Token[]){
        this.tokens=tokens;
        this.words=tokens.filter(k=>k.type==Token.Word);
    }
    toString(){
        let s="";
        this.tokens.forEach(k=>{s+=k.tok});
        return s;
    }
}

/**
 * Token is a token representing a word, punctuation, numbers, or unknown symbols
 */
export class Token {
    static Word = Symbol("Word");
    static Space = Symbol("Space");
    static LineSpace = Symbol("LineSpace");
    static PhraseEnd = Symbol("PhraseEnd");
    static SentenceEnd = Symbol("SentenceEnd");
    static ParagraphEnd = Symbol("ParagraphEnd");
    static EssayEnd = Symbol("EssayEnd");
    static Unknown = Symbol("Unknown");
    static None = Symbol("None");
    static Number = Symbol("Number");

    static SentenceTerminators=[Token.SentenceEnd,Token.ParagraphEnd,Token.EssayEnd]
    static ParagraphTerminators=[Token.ParagraphEnd,Token.EssayEnd]

    tok:string;
    position:number;
    type:symbol;
    constructor(tok:string,type:symbol){
        this.tok=tok;
        this.type=type;
        this.position=-1;
    }
}

/**
 * TokenParser turns string into list of tokens
 */
class Tokenizer {
    st:string;
    currnum:number;
    currchar:string;
    constructor(st:string){
        this.st=st;
        this.currnum=0;
        this.currchar=this.nextChar();
    }
    get finished(){
        return this.currnum>this.st.length;
    }
    nextChar(){
        this.currchar=this.st[this.currnum++];
        return this.currchar;
    }
    nextToken(){
        if(this.finished){
            return new Token("",Token.EssayEnd);
        }
        let tok:Token=new Token("",Token.None),curr="",type=Token.None;
        while(!this.finished){
            curr=this.currchar;
            if((/[a-zA-Z\-]/).test(curr)){
                type=Token.Word;
            } else if ((/[\d]/).test(curr)){
                type=Token.Number;
            } else if ((/ /).test(curr)){
                type=Token.Space;
            } else if ((/\n/).test(curr)){
                type=Token.LineSpace
            } else if ((/[,;]/).test(curr)){
                type=Token.PhraseEnd
            } else if ((/[.!?]/).test(curr)){
                type=Token.SentenceEnd
            } else if ((/\t/).test(curr)){
                type=Token.ParagraphEnd
            } else {
                type=Token.Unknown
            }
            if(type==tok.type){
                tok.tok+=curr;
                this.nextChar();
            } else if (tok.type==Token.None){
                tok = new Token(curr,type);
                this.nextChar();
            } else {
                return tok;
            }
        }
        return tok;
    }
    tokenize(tokop?:TokenOptions){
        let tokens:Token[]=[],tok:Token=this.nextToken(),options:TokenOptions=parseTokenOptions(tokop);
        let current=0;
        while(tok.type!=Token.EssayEnd){
            tokens.push(tok);
            tok.position=current++;
            tok=this.nextToken();
        }
        tokens.push(tok);
        tok.position=current;
        if(options.removeRandomLineBreaks){
            for(let i=0;i<tokens.length;i++){
                tokens[i].position=i;
                if(i<tokens.length-1&&tokens[i].type==Token.LineSpace&&tokens[i+1].type!=Token.ParagraphEnd){
                    tokens[i].type=Token.Space;
                    tokens[i].tok=" ";
                    i--;
                }
            }
        }
        return tokens;
    }
}
/**
 * TokenOptions are options for tokenizer
 */
export interface TokenOptions {
    removeRandomLineBreaks?:boolean
}

function parseTokenOptions(t?:TokenOptions){
    t=t||{};
    return {
        removeRandomLineBreaks:false,
        ...t
    }
}

/**
 * Essay Parser converts tokens into a paragraphs which contain sentences which contain tokens
 */
class EssayParser{
    tokens:Token[];
    currnum:number;
    currtoken:Token;

    constructor(tokens:Token[]){
        this.tokens=tokens;
        this.currnum=0;
        this.currtoken=this.nextToken();
    }
    get finished(){
        return this.currtoken.type==Token.EssayEnd;
    }
    nextToken(){
        this.currtoken=this.tokens[this.currnum++];
        return this.currtoken;
    }
    parse(){
        let paragraphs:Paragraph[] = [];
        while(!this.finished){
            let sentences:Sentence[] = [];
            while(Token.ParagraphTerminators.indexOf(this.currtoken.type)<0){
                let toks:Token[] = [];
                while(Token.SentenceTerminators.indexOf(this.currtoken.type)<0){
                    toks.push(this.currtoken);
                    this.nextToken();
                }
                if(this.currtoken.type==Token.SentenceEnd){
                    toks.push(this.currtoken);
                    this.nextToken();
                }
                toks.length>0 && sentences.push(new Sentence(toks));
                
            }
            if(this.currtoken.type==Token.ParagraphEnd){
                this.nextToken();
            }
            sentences.length>0 && paragraphs.push(new Paragraph(sentences));
            
        }
        return paragraphs;
    }
}