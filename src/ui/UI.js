/** Provisorische Anzeige; Chat 06 ersetzt sie später. */
export class UI {
 constructor(root){this.root=root;this.dialog=root.querySelector('#dialog');this.speaker=root.querySelector('#dialog-speaker');this.line=root.querySelector('#dialog-line');this.lines=[];this.index=0}
 setStatus(message){this.root.dataset.status=message;const el=this.root.querySelector('#map-label');if(el)el.textContent=message}
 isDialogOpen(){return this.lines.length>0}
 showDialog(e){this.lines=[...e.lines];this.index=0;this.speaker.textContent=e.speaker??'';this.renderDialog()}
 advanceDialog(){if(!this.isDialogOpen())return;this.index++;if(this.index>=this.lines.length){this.lines=[];this.index=0}this.renderDialog()}
 renderDialog(){this.dialog.hidden=!this.isDialogOpen();this.line.textContent=this.isDialogOpen()?this.lines[this.index]:''}
}
