class EventBus extends EventTarget {
    emit(event: string, detail?: any) {
      this.dispatchEvent(new CustomEvent(event, { detail }));
    }
  
    on(event: string, callback: (event: CustomEvent) => void) {
      this.addEventListener(event, (e) => callback(e as CustomEvent));
    }
  
    off(event: string, callback: (event: CustomEvent) => void) {
      this.removeEventListener(event, (e) => callback(e as CustomEvent));
    }
  }
  
  export const eventBus = new EventBus();