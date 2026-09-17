import { useState } from 'react';

export default function PostSections() {
  const [sent, setSent] = useState(false);
  return (
    <div className="post">
      <section className="acq">
        <div className="eyebrow">XIII · ACQUISITION</div>
        <h2>A residence, considered in full.</h2>
        <p>Every material, every measure, chosen for a single family who values quiet over spectacle.</p>
        <dl className="specs">
          <div><dt>RESIDENCE</dt><dd>YŪGEN</dd></div>
          <div><dt>LOCATION</dt><dd>Kyoto, Japan</dd></div>
          <div><dt>INTERIOR</dt><dd>310 m²</dd></div>
          <div><dt>GARDEN</dt><dd>1,200 m²</dd></div>
          <div><dt>BEDROOMS</dt><dd>2</dd></div>
          <div><dt>COMPLETION</dt><dd>2027</dd></div>
        </dl>
        <div className="price">FROM ¥480,000,000</div>
        <a className="cta" href="#inquiry">REQUEST PRIVATE DETAILS →</a>
      </section>
      <section className="inq" id="inquiry">
        <div className="eyebrow">XIV · INQUIRY</div>
        <h2>Arrange a private viewing.</h2>
        <p>Viewings are arranged individually, by appointment only.</p>
        {sent ? <p className="thanks">Thank you. We will be in touch within two days.</p> : (
          <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
            <label>NAME<input required name="name" /></label>
            <label>EMAIL<input required type="email" name="email" /></label>
            <label>COUNTRY<input name="country" /></label>
            <label>MESSAGE<textarea name="message" rows={3} /></label>
            <button type="submit" className="cta">REQUEST A PRIVATE VIEWING →</button>
          </form>
        )}
      </section>
      <footer><span className="kanji">幽玄</span><span>YŪGEN — A place for stillness.</span></footer>
    </div>
  );
}
