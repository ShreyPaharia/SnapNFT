import React, { useEffect, useState } from 'react';
import loadFilter from './loadFilter';
const AppCanvas = ({filterSrc}) => {
  console.log("filterSrc ->", filterSrc);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    loadFilter(() => {
      setLoaded(true);
      window.main();
    }, filterSrc);
  }, [filterSrc]);
  return (
    <div >
      {loaded ? (
        <>
          <canvas width="600" height="600" id="jeeFaceFilterCanvas"></canvas>
          <script> main(); </script>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
export default AppCanvas;