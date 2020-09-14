const { site } = require('../settings');

module.exports = function(body){
    return `<heml>
    <head>
      <subject>Welcome to HEML!</subject>
      <style>
        img{margin:0 auto;}
        h1{
          text-align: center;
          font-size: 20px;
          letter-spacing: 0px;
          color: #000000;
          opacity: 1;
        }
        p{
          text-align: center;
          font-size: 16px; 
          letter-spacing: 0px;
          color: #000000;
          opacity: 1;
        }
        
        span{
          text-align: center;
          display:block;
          color: #00a1bb;
          font-weight: 900;
        }
      </style>
    </head>
    <body>
      <container>
          <row>
            <column large="12">
              <img src="https://i.ibb.co/jLyjp6R/Logo-color-IH-2x.png" alt="my image" infer="retina" />
            </column>
          </row>
          <row>
            <column large="12">
              <h1>Recuperación de clave de acceso</h1>
              <br/>
              <p>¡Hola! ${body.name}</p>
              <p>Tu clave de acceso es:</p>
              <p>${body.pass}</p>
              <br/>
              <a href="${site}">Iniciar sesion</a>
            </column>
          </row>
      </container>
    </body>
  </heml>`
}