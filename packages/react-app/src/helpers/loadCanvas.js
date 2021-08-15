import React, { useEffect, useState } from 'react';
import loadFilter from './loadFilter';
const AppCanvas = ({filterSrc, rootPath, ref}) => {
  // console.log("filterSrc ->", filterSrc, window.main);
  const [loaded, setLoaded] = useState(false);
  // const ref = createRef(null);

  useEffect(() => {
    loadFilter(() => {
      setLoaded(true);
      // window.main && window.main();
      if(window.main){
        console.log(" Loading success ");
        window.main(rootPath, filterSrc);
      }
      else{
        console.log(" Not loadded ");
      }

    }, filterSrc);
  }, [filterSrc]);
  return (
    <div  ref={ref}>
      {loaded ? (
        <>
          <canvas width="600" height="600" id="jeeFaceFilterCanvas"></canvas>
          <script> main(rootPath); </script>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
export default AppCanvas;