new function(){this.onMessage=function(e){var n=e.data,s=n.type,t=n.event,o=new TextDecoder;console.log(s,JSON.parse(o.decode(t)))},self.addEventListener("message",this.onMessage.bind(this))};
