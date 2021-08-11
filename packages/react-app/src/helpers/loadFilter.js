const loadFilter = (callback, scriptSrc) => {
    const existingScript = document.getElementById('filterId');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.id = 'filterId';
      document.getElementsByTagName('head')[0].appendChild(script)
      // document.body.appendChild(script);
      script.onload = () => { 
        if (callback) callback();
      };
    }
    if (existingScript && callback) callback();
  };
  export default loadFilter;