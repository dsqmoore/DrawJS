window.addEvent('domready',function(){
	var data = location.hash.substr(1).parseQueryString();
	
	var canvas = new drawjs.Canvas('canvas');
	
	var background = new drawjs.Layer({system:true});
	var image = new drawjs.shape.Image({'src':data.src});
	image.addEvent('load',function(){
		var b = this.getBound();
		var w = Math.round(b.width*0.7);
		var h = Math.round(b.height*0.7);
		this.setSize(w,h);
		canvas.setSize(w,h);
		$('loading').setStyle('display','none');
	});
	background.add(image);
	canvas.push(background);
	canvas.add(new drawjs.Layer({name:'Layer 1'}));
	
	var history = new drawjs.History();
	var selection = new drawjs.Selection();
	
	var styling = new drawjs.Styling(selection,history);
	
	var clipboard = new drawjs.Clipboard(selection,canvas,history);
	
	var toolset = new drawjs.Toolset(canvas,selection,history,styling,
	data.v == "true" ? [
		drawjs.tool.Selector, 
		drawjs.tool.VSwap,
		drawjs.tool.HVDottedLine,
		drawjs.tool.HVUnderline,
		drawjs.tool.Pen,
		drawjs.tool.EllipseText,
		drawjs.tool.VText,
		drawjs.tool.VInsertText,
		drawjs.tool.HInsertText
	]:[
		drawjs.tool.Selector, 
		drawjs.tool.HSwap,
		drawjs.tool.HVDottedLine,
		drawjs.tool.HVUnderline,
		drawjs.tool.Pen,
		drawjs.tool.EllipseText,
		drawjs.tool.VText,
		drawjs.tool.VInsertText,
		drawjs.tool.HInsertText
	]);
	
	//toolbar
	
	Array.each(['selector','pen','hVUnderline','hVDottedLine','ellipseText','swap','text','vInsertText','hInsertText'],function(type){
		$('button-'+type).addEvent('click',function(){
			toolset.setType(type);
		});
	});
	$$('.button').addEvent('mousedown',function(e){
		e.preventDefault();
	});
	$('button-undo').addEvent('click',function(){
		history.undo();
	});
	$('button-redo').addEvent('click',function(){
		history.redo();
	});
	toolset.addEvents({
		'leave':function(type){
			$('button-'+type).removeClass('on');
		},
		'enter':function(type){
			$('button-'+type).addClass('on');
		}
	});
	
	toolset.setType('pen');
	
	//keyboard shortcuts
	var keyboard = new Keyboard({
	    defaultEventType: 'keydown',
	    events:{
	    	'ctrl+z':function(){ history.undo(); },
	    	'ctrl+y':function(){ history.redo(); },
	    	'ctrl+x':function(){ clipboard.cut(); },
	    	'ctrl+c':function(){ clipboard.copy(); },
	    	'ctrl+v':function(){ clipboard.paste(); },
	    	'delete':function(){ clipboard.hide(); }
	    }
	});
	
	//styling
	function strokeUpdate(){
		$('style-stroke').setStyle('backgroundColor',$('style-stroke').value);
	}
	
	Array.each(['lineWidth','stroke'],function(type){
		$('style-'+type).addEvent('change',function(){
			styling.setStyle(type,this.value);
		});
	});
	
	styling.addEvent('change',function(options){
		Object.each(options,function(value,key){
			if($('style-'+key)){
				$('style-'+key).set('value',value);
				strokeUpdate();
			}
		});
	});
	
	
	$('style-stroke').addEvent('change',strokeUpdate);
	
	strokeUpdate();
	
	//Text Area

	$('textOk').addEvent('click',function(){
		styling.setStyle('text',$('style-text').get('value'));
		$('textCover').setStyle('display','none');
		if(toolset.getType()=="text")
			toolset.setType('selector');
		keyboard.activate();
	});
	
	$('textCancel').addEvent('click',function(){
		$('textCover').setStyle('display','none');
		selection.deselect();
		keyboard.activate();
	});
	
	selection.addEvent('select',function(){
		switch(toolset.getType()) {
			case 'text':case 'ellipseText':case 'hInsertText':case 'vInsertText':
				keyboard.deactivate();
				$('textCover').setStyle('display','block');
				$('style-text').focus();
			break;
			default:
		}
	});
	
});

function toDataURL(){
	return $('canvas').toDataURL();
}
