class FeatureMedia extends HTMLElement {
  constructor() {
    super()
    this.videoBlock = this.querySelector('.feature-product__media-video');
    this.clip = this.videoBlock?.querySelector('video');
    this.img = this.querySelector('.feature-product__media-img');
    this.flag = true;
    this.addEventListener('mouseover', this.onMouseOver);
    this.addEventListener('mouseout', this.onMouseOut);
    this.addEventListener('touchend', this.onTouchEvent);
  }

  onMouseOver() {
    this.clip?.play();
  }

  onMouseOut() {
    this.clip?.pause();
  }

  onTouchEvent() {
    if (this.flag === true) {
      this.clip?.play();
      this.flag = false;
    }
    else {
      this.clip?.pause();
      this.flag = true;
    }
    if (this.clip) {
      this.img?.classList.toggle('feature-card-img-hover');
      this.videoBlock?.classList.toggle('feature-card-video-active');
    }
  }
}

if(!customElements.get('feature-media')) {
  customElements.define('feature-media', FeatureMedia);
}
