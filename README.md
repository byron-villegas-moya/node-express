# Node Express

Proyecto Node + Express + Axios + Json Web Token + Pino + Test Unitarios (mocha + chai + supertest) + Test de Aceptación (cucumber) + Test de Rendimiento (artillery/jmeter) + Reporte de Cobertura (nyc)

## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

**Clonar mediante SSH**
```shell
git clone git@github.com:byron-villegas-moya/node-express.git
```
**Clonar mediante HTTPS**
```shell
git clone https://github.com/byron-villegas-moya/node-express.git
```

Mira Deployment para conocer como desplegar el proyecto.

### Pre-requisitos 📋

_Que cosas necesitas para instalar el software y como instalarlas_

| Software | Versión  |
|----------|----------|
| node     | v16.14.2 |
| npm      | 8.5.0    |

#### Instalar Node

Para instalar Node debemos ir a la siguiente pagina: https://nodejs.org/en/download/ descargar el instalador, ejecutarlo y seguir los pasos para la instalación.

### Instalación 🔧

_Una serie de ejemplos paso a paso que te dice lo que debes ejecutar para tener un entorno de desarrollo ejecutandose_

Instalar las dependencias declaradas en el **package.json** mediante el siguiente comando:

```shell
npm install
```
**NOTA:** Node instalara todas las depedencias necesarias incluyendo las de desarrollo (test unitarios, test de aceptación, etc).

Instalación de dependencias finalizada mostrando el siguiente resultado en consola:

```shell
added 434 packages, and audited 435 packages in 9s

46 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

_Finaliza con un ejemplo de cómo obtener datos del sistema o como usarlos para una pequeña demo_

[Ver Demo ↗️](https://node-express-mp7s.onrender.com/api/productos)

Para desplegar la aplicación tenemos las siguientes formas:

Por defecto:

```shell
npm start
```
**NOTA:** Si se realiza un cambio a la aplicación no se reiniciará automáticamente.

Con nodemon:

```shell
npm run start:dev
```
**NOTA:** La aplicación se correra mediante nodemon (cualquier cambio realizado en un archivo js,json hará que la aplicación se refresque automáticamente).

La aplicación se desplegará exitosamente mostrando el siguiente resultado en consola:

```shell
Server is listening on http://localhost:3000/api
```

## Middleware 🚏
Un middleware es una función que se puede ejecutar antes o después del manejo de una ruta. Esta función tiene acceso al objeto Request, Response y la función next().

### Casos de Uso
Los principales casos de uso para los middleware son:

- Autenticacion JWT
- Logeo de errores
- Control de errores

### Authorization Middleware
Podemos construir nuestro propio Authorization Middleware el cual se encargará de verificar que las peticiones tengan el header **Authorization** y posteriormente validar que el token sea valido.

#### Ejemplo
```javascript
const Authorization = require("../constants/authorization");
const HttpStatus = require("../constants/http-status");
const Number = require("../constants/number");
const Symbol = require("../constants/symbol");
const { verifyToken } = require("../helpers/jwt.helper");

const authorizationMiddleware = (req, res, next) => {
    const headers = req.headers;

    if (!headers.authorization) {
        return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    if (!headers.authorization.toUpperCase().includes(Authorization.TYPE.toUpperCase())) {
        return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    const token = headers.authorization.substring(headers.authorization.indexOf(Symbol.SPACE) + Number.ONE, headers.authorization.length).trim();
    
    if (!verifyToken(token)) {
        return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    next();
}

module.exports = { authorizationMiddleware }
```
Como podemos ver se hacen las siguientes validaciones:

- El encabezado **Authorization** es obligatorio.
- El tipo de Authorization debe ser **Bearer**.
- El token debe ser valido (**signature + tiempo de expiración**).

#### Uso
Para usar el Authorization Middleware debemos importarlo y usarlo en las rutas que nos interesa validar la autenticación.

##### Ejemplo
```javascript
const express = require('express');
const router = express.Router();
const { authorizationMiddleware } = require('../middlewares/authorization.middleware');
const { getUsuarios } = require('../controllers/usuario.controller');
const { authorizeMiddleware } = require('../middlewares/authorize.middleware');

router.use(authorizationMiddleware);

router.get('', authorizeMiddleware(['ROLE_USER_EXPRESS', 'ROLE_USER_NODE']), getUsuarios);

module.exports = router;
```
Como podemos ver importamos el Authorization Middleware y solamente lo usamos, al hacer esto automáticamente se solicitará el encabezado **Authorization** y que el token sea válido (**signature + tiempo de expiración**) para todas las rutas definidas dentro del archivo.

### Authorize Middleware
Podemos construir nuestro propio Authorize Middleware el cual se encargará de verificar que el o los roles dentro del token sean validos para la ruta definida con su correspondiente rol o roles.

#### Ejemplo
```javascript
const HttpStatus = require('../constants/http-status');
const Number = require("../constants/number");
const Symbol = require("../constants/symbol");
const { getTokenRoles } = require("../helpers/jwt.helper");

const authorizeMiddleware = (roles) => {
    return [
        (req, res, next) => {
            const headers = req.headers;
            const token = headers.authorization.substring(headers.authorization.indexOf(Symbol.SPACE) + Number.ONE, headers.authorization.length).trim();
            const rolesToken = getTokenRoles(token);

            const isRolValid = roles.some(rol => rolesToken.indexOf(rol) >= Number.ZERO);

            if (!isRolValid) {
                return res.status(HttpStatus.UNAUTHORIZED).send();
            }

            next();
        }
    ];
}

module.exports = { authorizeMiddleware };
```
Como podemos ver valida que el rol que venga en el token exista en la lista de roles definida para la ruta.

#### Uso
Para usar el Authorize Middleware debemos importarlo y usarlo en las rutas que nos interesa validar el rol.

##### Ejemplo
```javascript
const express = require('express');
const router = express.Router();
const { authorizationMiddleware } = require('../middlewares/authorization.middleware');
const { getUsuarios } = require('../controllers/usuario.controller');
const { authorizeMiddleware } = require('../middlewares/authorize.middleware');

router.use(authorizationMiddleware);

router.get('', authorizeMiddleware(['ROLE_USER_EXPRESS', 'ROLE_USER_NODE']), getUsuarios);

module.exports = router;
```
Como podemos ver importamos el Authorize Middleware y solamente lo usamos en las rutas que deseamos validar el rol con los roles correspondientes que pueden ejecutar la ruta, al hacer esto automáticamente se validará que el rol que venga del token corresponda con los que permite la ruta.

### Loggeo de Errores Middleware
Podemos construir nuestro propio Loggeo de Errores Middleware el cual se encargará de loguear los mensajes de error de la aplicación por consola.

#### Ejemplo
```javascript
const logger = require('pino')();
const ErrorNegocioException = require("../exceptions/error-negocio.exception");
const ErrorTecnicoException = require("../exceptions/error-tecnico.exception");

const errorLoggerMiddleware = (error, req, res, next) => {
    if (error instanceof ErrorNegocioException || error instanceof ErrorTecnicoException) {
        logger.error({ type: error.constructor.name, msg: error });
    }
    else {
        logger.error({ type: error.constructor.name, msg: error.message });
    }

    next(error);
}

module.exports = { errorLoggerMiddleware }
```
Como podemos ver el logeo se hace de las siguientes maneras:

- Si el error es de tipo **Negocio** o **Tecnico** mostramos el error con el nombre del tipo de error y mensaje (**cuerpo del error**) EJ.: ```{ type: 'ErrorNegocioException', msg: { codigo: 'EX0001', mensaje: 'Error' } }``` esto nos permite tener mayor visibilidad del error
- Si el error es distinto a **Negocio** y **Tecnico** Mostramos el error con el nombre del tipo de error y mensaje (**texto plano**)

#### Uso
Para usar el Loggeo de Errores Middleware debemos importarlo y usarlo en la aplicación principal.

##### Ejemplo
```javascript
const server = require('./configs/server.config');
const { config } = require('./configs/config');

const { requestLoggerMiddleware } = require('./middlewares/request-logger-middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { errorLoggerMiddleware } = require('./middlewares/error-logger.middleware');

server.use(requestLoggerMiddleware);

server.use(config.server.context + config.routes.auth, require('./routes/auth.route'));
server.use(config.server.context + config.routes.usuarios, require('./routes/usuario.route'))
server.use(config.server.context + config.routes.productos, require('./routes/producto.route'));

server.use(errorLoggerMiddleware);
server.use(errorMiddleware);

module.exports = server;
```
Como podemos ver importamos el Loggeo de Errores Middleware y solamente lo usamos, al hacer esto automáticamente los errores que ocurren en la aplicación serán mostrados por consola.

**Ejemplo de error en consola**
```shell
{"level":50,"time":1659398849492,"pid":3076,"hostname":"DESKTOP","type":"ErrorNegocioException","msg":{"codigo":"EXPNE0000","mensaje":"Producto no encontrado."}}
```

### Respuesta Personalizada por Tipo de Error (HTTP STATUS) Middleware
Podemos construir nuestro propio Respuesta Personalizada por Tipo de Error (HTTP STATUS) Middleware el cual se encargará de tomar los errores que ocurren en la aplicación y responder un código HTTP correspondiente al tipo de error.

#### Ejemplo
```javascript
const ErrorMessage = require("../constants/error-message");
const HttpStatus = require("../constants/http-status");
const ErrorNegocioException = require("../exceptions/error-negocio.exception");
const ErrorTecnicoException = require("../exceptions/error-tecnico.exception");

const errorMiddleware = (error, req, res, next) => {
    if (error instanceof ErrorNegocioException) {
        return res.status(HttpStatus.BAD_REQUEST).send(error);
    }

    if(error instanceof ErrorTecnicoException) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);   
    }
    
    if(!(error instanceof ErrorNegocioException) && !(error instanceof ErrorTecnicoException)) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(new ErrorTecnicoException(ErrorMessage.CODIGO_ERROR__DEL_SERVIDOR, ErrorMessage.MENSAJE_ERROR_DEL_SERVIDOR));
    }
}

module.exports = { errorMiddleware }
```
Como podemos ver la respuesta cambia de las siguientes maneras:

- Si el error es de tipo **Negocio** entonces retornamos un **409 CONFLICT** con el cuerpo del error ```{ codigo: 'EX0001', mensaje: 'Error' }```
- Si el error es de tipo **Tecnico** entonces retornamos un **500 INTERNAL SERVER ERROR** con el cuerpo del error ```{ codigo: 'EX0001', mensaje: 'Error' }```
- Si el error es distinto a **Negocio** y **Tecnico** entonces lo transformamos a un error **Tecnico** pasandole el mensaje del error con un código y mensaje genérico ```{ codigo: 'EXES0000', mensaje: 'Error del servidor.' }```

#### Uso
Para usar el Respuesta Personalizada por Tipo de Error (HTTP STATUS) Middleware debemos importarlo y usarlo en la aplicación principal.

##### Ejemplo
```javascript
const server = require('./configs/server.config');
const { config } = require('./configs/config');

const { requestLoggerMiddleware } = require('./middlewares/request-logger-middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { errorLoggerMiddleware } = require('./middlewares/error-logger.middleware');

server.use(requestLoggerMiddleware);

server.use(config.server.context + config.routes.auth, require('./routes/auth.route'));
server.use(config.server.context + config.routes.usuarios, require('./routes/usuario.route'))
server.use(config.server.context + config.routes.productos, require('./routes/producto.route'));

server.use(errorLoggerMiddleware);
server.use(errorMiddleware);

module.exports = server;
```
Como podemos ver importamos el Respuesta Personalizada por Tipo de Error (HTTP STATUS) Middleware y solamente lo usamos, al hacer esto automáticamente los errores que ocurren en la aplicación serán entregados con su código HTTP correspondiente.

## Ejecutando las pruebas ⚙️

_Explica como ejecutar las pruebas automatizadas para este sistema_

### Pruebas unitarias 📑

_Explica que verifican estas pruebas y por qué_

Los test unitarios son para comprobar que un fragmento de código determinado está funcionando de manera correcta, cabe destacar que si modificamos una funcionalidad toda prueba unitaria asociada a esa funcionalidad fallará si no es refactorizada debidamente.

#### Configuración

##### nyc

_Herramienta utilizada para generar los reportes de cobertura del código mediante los tests unitarios._

Para configurar nyc utilizaremos el siguiente archivo:

###### nyc.config.js

```javascript
module.exports = {
  exclude: [
    'index.js',
    '.mocharc.js',
    'nyc.config.js',
    'coverage',
    'cucumber.js',
    'artillery/processor.js',
    'acceptance-test',
    'jmeter-result',
    'test'
  ],
  all: true,
  checkCoverage: true,
  reporter: ['text-summary','html'],
  branches: 90,
  functions: 90,
  lines: 90,
  statements: 90
}
```

###### Parametros

- exclude: Son los directorios y/o archivos que deseamos excluir del reporte de cobertura
- all: Flag para indicar si se precargar todos los archivos (ambientar completamente o no)
- checkCoverage: Flag para indicar si se verifica la cobertura respecto a los porcentajes configurados para cada tipo: Statements, Branches, Functions y Lines
- reporter: Lista de tipos de reporte a generar EJ.: html, text-summary, text, etc
- branches: Porcentaje (%) a utilizar para verificar si branches cumplen o no (checkCoverage)
- functions: Porcentaje (%) a utilizar para verificar si functions cumplen o no (checkCoverage)
- sines: Porcentaje (%) a utilizar para verificar si lines cumplen o no (checkCoverage)
- statements: Porcentaje (%) a utilizar para verificar si statements cumplen o no (checkCoverage)

##### mocha

_Herramienta utilizada ejecutar los tests unitarios._

Para configurar mocha utilizaremos el siguiente archivo:

###### .mocharc.js

```javascript
module.exports = {
    exit: true,
    recursive: true
}
```

###### Parametros

- exit: Flag para indicar si al finalizar todos los tests unitarios se termina el proceso o no
- recursive: Flag para indicar si se buscan o no los tests unitarios en sub carpetas del directorio /test (por defecto se ejecutan los que estan en el directorio /test)

#### Ejecución

Para ejecutar los test unitarios debemos utilizar el siguiente comando:

```shell
npm test
```
**NOTA:** Se ejecutarán todos los tests declarados en el directorio /test.

Los tests unitarios se ejecutarán exitosamente mostrando el siguiente resultado en consola:

```shell
  Obtener productos
    ✔ Retorna una lista de productos

  Obtener producto mediante sku ok
    ✔ Retorna el producto

  Obtener producto mediante sku con tipo valor erroneo
{"level":50,"time":1657684014136,"pid":6056,"hostname":"DESKTOP-O2SMH87","type":"ErrorNegocioException","msg":{"codigo":"EXSKUDSNE0000","mensaje":"El sku debe ser un n├║mero entero."}}
    ✔ Retorna error negocio exception

  Obtener producto mediante sku inexistente
{"level":50,"time":1657684014144,"pid":6056,"hostname":"DESKTOP-O2SMH87","type":"ErrorNegocioException","msg":{"codigo":"EXPNE0000","mensaje":"Producto no encontrado."}}
    ✔ Retorna error negocio exception

  Obtener productos ordenados por precio descendiente
    ✔ Retorna la lista de productos ordenados por precio descendiente

  Obtener productos ordenados por maca ascendente
    ✔ Retorna la lista de productos ordenados por marca ascendente

  Obtene productos ordenados por una propiedad inexistente
{"level":50,"time":1657684014217,"pid":6056,"hostname":"DESKTOP-O2SMH87","type":"Error","msg":"Propiedad no encontrada"}
    ✔ Retorna error tecnico exception

  Obtener productos filtrados por precio
    ✔ Retorna la lista de productos filtrada por precio

  Obtener productos filtrados por marca
    ✔ Retorna la lista de productos filtrada por marca

  Obtener productos filtrados por propiedad inexistente
{"level":50,"time":1657684014235,"pid":6056,"hostname":"DESKTOP-O2SMH87","type":"ErrorNegocioException","msg":{"codigo":"EXPNE0000","mensaje":"Propiedad no encontrada."}}
    ✔ Retorna error negocio exception

  Obtener productos filtrados por propiedad y formato de valor no permitido
{"level":50,"time":1657684014243,"pid":6056,"hostname":"DESKTOP-O2SMH87","type":"ErrorTecnicoException","msg":{"codigo":"EXFDVNPPLP0000","mensaje":"Formato de valor no permitido para la propiedad."}}
    ✔ Retorna error tecnico exception

  Generar token ok
    ✔ Retorna los datos del usuario mas el token

  Generar token con request erroneo
    ✔ Retorna bad request

  Generar token con credenciales invalidas
    ✔ Retorna unauthorized

  Obtener usuarios
    ✔ Retorna una lista de usuarios

  Obtener usuarios sin token
    ✔ Retorna unauthorized

  Obtener usuarios con token invalido
    ✔ Retorna unauthorized

  Suma de dos numeros
    ✔ Sumar 1 + 1

  Generar token para usuario
    ✔ Generar token usuario byron.villegas

  Validar token generado ok
    ✔ Validar token

  Validar token generado con error
    ✔ Validar token

  Validar token expirado
    ✔ Validar token


  22 passing (248ms)

=============================== Coverage summary ===============================
Statements   : 99.04% ( 208/210 )
Branches     : 100% ( 54/54 )
Functions    : 100% ( 31/31 )
Lines        : 98.99% ( 197/199 )
================================================================================
```
**NOTA:** Como resultado de los test unitarios se mostrará por consola el resumen de cubertura y además se generará un reporte de coverage en el directorio /coverage en un archivo index.html.

##### Reporte de cobertura de los tests unitarios

![-----------------------------](/docs/img01.png)
**NOTA:** Como podemos ver estan los porcentajes correspondientes para las siguientes categorías: Statements, Branches, Functions y Lines

### Pruebas de aceptación ✅

_Explica que verifican estas pruebas y por qué_

Los test de aceptación son para probar las funcionalidades de la aplicación desde la perspectiva del cliente donde se evalúan las entradas y salidas.

#### Configuración

##### cucumber

_Herramienta utilizada para definir y ejecutar pruebas unitarias a partir de criterios de aceptación, fácilmente entendibles por todos los stakeholders directos/indirectos del proceso._

_Cabe destacar que cucumber genera un reporte de los tests ejecutados._

Para configurar cucumber utilizaremos el siguiente archivo:

###### cucumber.js

```javascript
module.exports = {
    default: {
        publishQuiet: true,
        parallel: 0,
        format: ['html:cucumber-report.html'],
        paths: ['acceptance-test/features/' + (process.env.npm_config_ambiente || 'dev')],
        require: ['acceptance-test/steps'],
        parameters: {
            HOST: process.env.npm_config_host || 'http://localhost',
            PORT: process.env.npm_config_port || 3000,
            CONTEXT_PATH: process.env.npm_config_context_path || '/api',
            AMBIENTE: process.env.npm_config_ambiente || 'dev'
        }
    }
}
```

###### Parametros

- publishQuiet: Flag para indicar si deseamos saltar la publicidad o no
- parallel: Número de ejecución de scenarios en paralelo
- format: Formato del reporte de cucumber
- paths: Directorios donde se encuentran los features /dev o /qa
- require: Directorios donde se encuentran los steps (implementaciones de los features)
- parameters: Parametros para los steps como: HOST, PORT, CONTEXT_PATH, AMBIENTE

#### Ejecución

##### Pre-condición

_La aplicación debe estar corriendo._

Para ejecutar los test de aceptación debemos utilizar el siguiente comando:

```shell
npm run test:acceptance
```
**NOTA:** Por defecto tomará la siguiente configuración: HOST=http://localhost PORT=3000 CONTEXT_PATH=/api AMBIENTE=dev

Para ejecutar los test de aceptación con configuraciones personalizadas debemos utilizar el siguiente comando:

```shell
npm run test:acceptance --HOST=http://localhost --PORT=3000 --CONTEXT_PATH=/api --AMBIENTE=dev
```
**NOTA:** Los parametros deben reflejar la configuración utilizada para correr la aplicación.

##### Parametros de ejecución

- HOST: Es la unión de **<span style="color:gold;">protocolo</span> + <span style="color:green;">subdominio</span> + <span style="color:blue;">dominio</span> + <span style="color:red;">tld</span>** quedando de la siguiente manera: **<span style="color:gold;">http://</span><span style="color:green;">www.</span><span style="color:blue;">localhost</span><span style="color:red;">.cl</span>**
- PORT: Es el puerto de la aplicación EJ.: 80, 8080, 3000
- CONTEXT_PATH: Es el path base de la aplicacion EJ.: /api
- AMBIENTE: Es el ambiente de los test a ejecutar (Los datos de pruebas no siempre son los mismos en diferentes ambientes) cada ambiente tiene su directorio de features /dev o /qa

Los tests de aceptación se ejecutarán exitosamente mostrando el siguiente resultado en consola:

```shell
.................................

11 scenarios (11 passed)
33 steps (33 passed)
0m00.912s (executing steps: 0m00.165s)
```
**NOTA:** Como resultado de los test de aceptación se generará un reporte de las pruebas realizadas en el archivo cucumber-report.html.

##### Reporte de los tests de aceptación

![-----------------------------](/docs/img02.png)
**NOTA:** Como podemos ver estan los feature definidos con sus respectivos scenarios.

### Pruebas de rendimiento 📈

_Explica que verifican estas pruebas y por qué_

Los test de rendimiento son para determinar el rendimiento de la aplicación bajo una carga de trabajo definida utilizando diferentes tipos de pruebas de rendimiento como pruebas de carga, estrés y estabilidad.

#### Herramientas

##### Artillery

_Artillery es un conjunto de herramientas de prueba de rendimiento moderno, potente y fácil de usar. Úselo para enviar aplicaciones escalables que mantienen su rendimiento y resistencia bajo una carga alta._

_Cabe destacar que Artillery genera un reporte de los tests ejecutados._

###### Configuración

Para configurar Artillery utilizaremos el siguiente archivo:

###### node-express.yml

```yml
config:
  target: ""
  environments: # Ambientes
    qa:
      target: "{{ $processEnvironment.TARGET }}"
      phases:
    dev:
      target: "{{ $processEnvironment.TARGET }}"
    local:
      target: "http://localhost:3000/api"
  phases: # Las fases pueden ser dinamicas por ambientes
    - duration: 20 # Duracion en segundos
      arrivalRate: 10 # Cantidad de usuarios
  plugins:
    expect: {} # Carga por defecto los plugins instalados
  processor: "./processor.js" # Archivo por defecto para funciones personalizadas
  payload: # Carga previa de datos
    path: "./login.csv" # Utilizamos un login csv
    fields:
      - "username" # Obtenemos el username (se transforman en variables globales)
      - "password" # Obtenemos el password (se transforman en variables globales)
before: # Antes de ejecutar los scenarios
  flow:
    - log: "Obtener Token" # Log obtener token
    - post: # Metodo http
        url: "/auth" # Url del servicio
        json: # Formato del body
          username: "{{ username }}" # Usamos las variables globales
          password: "{{ password }}" # Usamos las variables globales
        capture: # Captura el resultado
          - json: "$.accessToken" # Formato del resultado .atributo
            as: "accessToken" # Nombre de la variable global
scenarios: # Lista de scenarios
  - name: "Autenticacion de usuario" # Nombre del scenario
    flow:
      - post: # Metodo http
          url: "/auth" # Url del servicio
          json: # Formato del body
            username: "{{ username }}" # Usamos las variables globales
            password: "{{ password }}" # Usamos las variables globales
          expect:
          - statusCode: 200
          - contentType: json
  - name: "Obtener usuarios"
    flow:
      - get: # Metodo http
          url: "/usuarios" # Url del servicio
          headers: # Headers personalizados
            authorization: "{{ accessToken }}" # Usamos la variable global
          expect:
          - statusCode: 200
          - contentType: json
  - name: "Obtener productos"
    flow:
      - get:
          url: "/productos"
          expect:
          - statusCode: 200
          - contentType: json
  - name: "Obtener producto mediante sku"
    flow:
      - get:
          url: "/productos/{{sku}}" # Usamos la variable generada por la funcion
          beforeRequest: obtenerSkuProducto # Funcion personalizada dentro del processor.js para obtener el sku de un producto de la lista de productos.json
          expect:
          - statusCode: 200
          - contentType: json
  - name: "Obtener productos ordenados por una propiedad"
    flow:
      - get:
          url: "/productos"
          qs: # Parametros query ?
            sort: "-precio" # parametro: valor
          expect:
          - statusCode: 200
          - contentType: json
  - name: "Filtrar productos por una propiedad"
    flow:
      - get:
          url: "/productos"
          qs:
            marca: "Nintendo"
          expect:
          - statusCode: 200
          - contentType: json
```

###### processor.js

```javascript
const productos = require('../data/productos.json');

obtenerSkuProducto = (requestParams, ctx, ee, next) => {
    const producto = productos[0];
    ctx.vars['sku'] = producto.sku;
    return next();
}

module.exports = {
    obtenerSkuProducto,
};
```
**NOTA:** Con processor.js podemos definir funciones personalizadas para utilizarlas en el archivo de configuracion de Artillery.

###### Ejecución

**Pre-condición**

_La aplicación debe estar corriendo._

Para ejecutar los test de rendimiento debemos utilizar el siguiente comando:

```shell
npm run test:performance
```
**NOTA:** Por defecto ejecutará el ambiente local con el siguiente target: http://localhost:3000/api

Para ejecutar los test de rendimiento con un ambiente personalizado debemos utilizar los siguientes comandos:

```shell
export HOST="https://node-express-mp7s.onrender.com"
export PORT="443"
export CONTEXT_PATH="/api"
export TARGET="$HOST:$PORT$CONTEXT_PATH"
npx artillery run -e dev performance-test/artillery/node-express.yml --output artillery-test.json
```
**NOTA:** Para que la url del target sea dinámica utilizamos $processEnvironment.TARGET el único inconveniente de Artillery es que debemos crear estas variables de entorno antes de ejecutar los test de rendimiento

###### Parametros de ejecución

- e: Environment que deseamos utilizar EJ.: local, dev, qa
- output: Archivo en el que deseamos almacenar el resultado de los test de rendimiento

Los tests de rendimiento se ejecutarán exitosamente mostrando el siguiente resultado en consola:

```shell
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
* POST /api/auth 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200 
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json 
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/usuarios
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
* POST /api/auth 
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200 
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200 
  ok contentType json
* POST /api/auth 
  ok statusCode 200
  ok contentType json
* POST /api/auth 
  ok statusCode 200
  ok contentType json
* POST /api/auth 
  ok statusCode 200 
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410
  ok statusCode 200
  ok contentType json
* POST /api/auth 
  ok statusCode 200 
  ok contentType json
* POST /api/auth
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200 
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410
  ok statusCode 200 
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200 
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* POST /api/auth 
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200 
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200 
  ok contentType json
* GET /api/usuarios
  ok statusCode 200
  ok contentType json
* GET /api/productos 
  ok statusCode 200 
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200 
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200 
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* POST /api/auth 
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200 
  ok contentType json
* GET /api/productos/15207410 
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/productos/15207410
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
* GET /api/productos 
  ok statusCode 200
  ok contentType json
* GET /api/usuarios
  ok statusCode 200
  ok contentType json
* GET /api/usuarios
  ok statusCode 200
  ok contentType json
Phase completed: unnamed (index: 0, duration: 20s) 18:44:13(-0400)

* GET /api/usuarios
  ok statusCode 200
  ok contentType json
* GET /api/productos
  ok statusCode 200
  ok contentType json
* GET /api/usuarios 
  ok statusCode 200 
  ok contentType json
--------------------------------------
Metrics for period to: 18:44:10(-0400) (width: 9.774s)
--------------------------------------

http.codes.200: ................................................................ 100
http.request_rate: ............................................................. 10/sec
http.requests: ................................................................. 100
http.response_time:
  min: ......................................................................... 0
  max: ......................................................................... 2
  median: ...................................................................... 1
  p95: ......................................................................... 1
  p99: ......................................................................... 2
http.responses: ................................................................ 100
plugins.expect.ok: ............................................................. 200
plugins.expect.ok.contentType: ................................................. 100
plugins.expect.ok.statusCode: .................................................. 100
vusers.completed: .............................................................. 100
vusers.created: ................................................................ 100
vusers.created_by_name.Autenticacion de usuario: ............................... 22
vusers.created_by_name.Filtrar productos por una propiedad: .................... 15
vusers.created_by_name.Obtener producto mediante sku: .......................... 11
vusers.created_by_name.Obtener productos: ...................................... 22
vusers.created_by_name.Obtener productos ordenados por una propiedad: .......... 17
vusers.created_by_name.Obtener usuarios: ....................................... 13
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 2.1
  max: ......................................................................... 7.8
  median: ...................................................................... 2.7
  p95: ......................................................................... 4.5
  p99: ......................................................................... 6.4


All VUs finished. Total time: 25 seconds

--------------------------------
Summary report @ 18:44:17(-0400)
--------------------------------

http.codes.200: ................................................................ 200
http.request_rate: ............................................................. 10/sec
http.requests: ................................................................. 200
http.response_time:
  min: ......................................................................... 0
  max: ......................................................................... 2
  median: ...................................................................... 1
  p95: ......................................................................... 1
  p99: ......................................................................... 2
http.responses: ................................................................ 200
plugins.expect.ok: ............................................................. 400
plugins.expect.ok.contentType: ................................................. 200
plugins.expect.ok.statusCode: .................................................. 200
vusers.completed: .............................................................. 200
vusers.created: ................................................................ 200
vusers.created_by_name.Autenticacion de usuario: ............................... 35
vusers.created_by_name.Filtrar productos por una propiedad: .................... 34
vusers.created_by_name.Obtener producto mediante sku: .......................... 26
vusers.created_by_name.Obtener productos: ...................................... 39
vusers.created_by_name.Obtener productos ordenados por una propiedad: .......... 33
vusers.created_by_name.Obtener usuarios: ....................................... 33
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 2
  max: ......................................................................... 33.1
  median: ...................................................................... 2.9
  p95: ......................................................................... 5.8
  p99: ......................................................................... 21.5
Log file: artillery-test.json
```

###### Reporte de los test de rendimiento

Para generar los reportes de los test de rendimiento debemos ejecutar el siguiente comando:

```shell
npm run test:performance-report
```
**NOTA:** Importante la generación del reporte depende del resultado de los test de rendimiento (**artillery-test.json**).

Finalmente nos generará un archivo **artillery-report.html**

![-----------------------------](/docs/img10.png)
**NOTA:** Como podemos ver tenemos una tabla con la cantidad de codigos 200, requests, responses y expect ok (serian los assert).

##### JMeter

_JMeter es una herramienta open source para analizar, medir el rendimiento y cargar el comportamiento funcional de la aplicación y la variedad de servicios._

_Cabe destacar que JMeter genera un reporte de los tests ejecutados._

###### Pre-requisitos 📋

_Que cosas necesitas para instalar el software y como instalarlas_

| Software      | Versión  |
|---------------|----------|
| Apache JMeter | 5.5      |

###### Instalar Apache JMeter

Para instalar JMeter debemos ir a la siguiente pagina: https://jmeter.apache.org/download_jmeter.cgi descargar apache-jmeter-5.5.tgz o apache-jmeter-5.5.zip dependiendo del caso, posteriormente dejar JMeter en un directiorio y crear las variables de entorno correspondiente:

###### Variables de entorno

- JMETER_HOME: Es la ruta principal de JMeter EJ.: C:/apache-jmeter-5.5
- PATH: es la ruta principal de JMeter mas la carpeta /bin EJ.: %JMETER_HOME%/bin

###### Configuración

Para configurar JMeter utilizaremos el siguiente archivo:

###### node-express.jmx

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="node-express" enabled="true">
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">true</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments" />
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Defaults" enabled="true">
        <collectionProp name="HeaderManager.headers">
          <elementProp name="" elementType="Header">
            <stringProp name="Header.name">Content-Type</stringProp>
            <stringProp name="Header.value">application/json</stringProp>
          </elementProp>
        </collectionProp>
      </HeaderManager>
      <hashTree />
      <ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults" enabled="true">
        <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
          <collectionProp name="Arguments.arguments" />
        </elementProp>
        <stringProp name="HTTPSampler.domain">${__P(vHOST)}</stringProp>
        <stringProp name="HTTPSampler.port">${__P(vPORT)}</stringProp>
        <stringProp name="HTTPSampler.protocol">${__P(vPROTOCOL)}</stringProp>
        <stringProp name="HTTPSampler.contentEncoding"></stringProp>
        <stringProp name="HTTPSampler.path"></stringProp>
        <stringProp name="HTTPSampler.concurrentPool">6</stringProp>
        <stringProp name="HTTPSampler.connect_timeout"></stringProp>
        <stringProp name="HTTPSampler.response_timeout">${__P(vTIMEOUT)}</stringProp>
      </ConfigTestElement>
      <hashTree />
      <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree" enabled="true">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>true</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <sentBytes>true</sentBytes>
            <url>true</url>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="filename"></stringProp>
      </ResultCollector>
      <hashTree />
      <ResultCollector guiclass="SummaryReport" testclass="ResultCollector" testname="Summary Report" enabled="true">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>true</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <sentBytes>true</sentBytes>
            <url>true</url>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="filename"></stringProp>
      </ResultCollector>
      <hashTree />
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```
**NOTA:** Cabe destacar que de buena a primeras no entenderemos el xml de configuracion de JMeter

###### Definir Plan de Pruebas

Para poder modificar el plan de pruebas de JMeter debemos ejecutar el siguiente comando dentro de la raíz del proyecto:

```shell
jmeter -t performance-test/jmeter/node-express.jmx -JvPROTOCOL=http -JvHOST="localhost" -JvPORT=3000 -JvCONTEXT=/api -JvVERSION=/ -JvAMBIENTE=dev -JvTHREADS=10 -JvTIMEOUT=8000 -JvRAMP_UP=1
```

![-----------------------------](/docs/img03.png)


JMeter se desplegará exitosamente mostrando el siguiente resultado en consola:

```shell
================================================================================
Don't use GUI mode for load testing !, only for Test creation and Test debugging.
For load testing, use CLI Mode (was NON GUI):
   jmeter -n -t [jmx file] -l [results file] -e -o [Path to web report folder]
& increase Java Heap to meet your test requirements:
   Modify current env variable HEAP="-Xms1g -Xmx1g -XX:MaxMetaspaceSize=256m" in the jmeter batch file
Check : https://jmeter.apache.org/usermanual/best-practices.html
================================================================================
```

Posteriormente se abrirá el GUI de JMeter:

![-----------------------------](/docs/img04.png)

**NOTA:** Como podemos ver se cargará el plan de pruebas con sus respectivos test

_Mediante el GUI de JMETER podemos ir creando/modificando los test_

###### Ejecución

**Pre-condición**

_La aplicación debe estar corriendo._

###### GUI

Para ejecutar los test de rendimiento debemos utilizar el botón ▶️ marcado con un borde rojo:

![-----------------------------](/docs/img05.png)

**NOTA:** Se empezarán a ejecutar los tests

![-----------------------------](/docs/img06.png)

**NOTA:** Como podemos ver el botón ▶️ se deshabilito y se habilito el botón 🛑 para parar la ejecución de los tests.

**Resultado**

Para ver el resultado de los test debemos entrar en la sección **View Results Tree** marcado con un borde rojo:

![-----------------------------](/docs/img07.png)

**NOTA:** Como podemos ver se ejecutaron los test de manera correcta (color verde).

###### Consola

Para ejecutar los test de rendimiento por consola debemos ejecutar el siguiente comando:

```shell
jmeter -n -t jmeter/node-express.jmx -JvPROTOCOL=http -JvHOST="localhost" -JvPORT=3000 -JvCONTEXT=/api -JvVERSION=/ -JvAMBIENTE=dev -JvTHREADS=10 -JvTIMEOUT=8000 -JvRAMP_UP=1 -LDEBUG -l test_results.jtl -e -o jmeter-result
```

Los tests se ejecutarán exitosamente mostrando el siguiente resultado en consola:

```shell
Creating summariser <summary>
Created the tree successfully using jmeter/node-express.jmx
Starting standalone test @ 2022 Jul 17 15:23:42 CLT (1658085822467)
Waiting for possible Shutdown/StopTestNow/HeapDump/ThreadDump message on port 4445
summary =     51 in 00:00:05 =   10.6/s Avg:     5 Min:     2 Max:    46 Err:     0 (0.00%)
Tidying up ...    @ 2022 Jul 17 15:23:47 CLT (1658085827440)
... end of run
```

![-----------------------------](/docs/img08.png)

**NOTA:** Como resultado de los test se generará un reporte de JMeter en el directorio /jmeter-result en un archivo index.html.

###### Reporte de los test de rendimiento

![-----------------------------](/docs/img09.png)
**NOTA:** Como podemos ver tenemos un grafico de los test ejecutados, tambien la tolerancia de cada test.

## Despliegue 📦

_Agrega notas adicionales sobre como hacer deploy_

Para desplegar la aplicación tenemos las siguientes formas:

Por defecto:

```shell
npm start
```
**NOTA:** Si se realiza un cambio a la aplicación no se reiniciará automáticamente.

Con nodemon:

```shell
npm run start:dev
```
**NOTA:** La aplicación se correra mediante nodemon (cualquier cambio realizado en un archivo js,json hará que la aplicación se refresque automáticamente).

La aplicación se desplegará exitosamente mostrando el siguiente resultado en consola:

```shell
Server is listening on http://localhost:3000/api
```

## Construido con 🛠️

_Menciona las herramientas que utilizaste para crear tu proyecto_

### Dependecias 🗃️

| Paquete       | Versión | Página NPM                                  | Página Documentación                              |
|---------------|---------|---------------------------------------------|---------------------------------------------------|
| axios         | 0.27.2  | https://www.npmjs.com/package/axios         | https://github.com/axios/axios                    |
| body-parser   | 1.20.0  | https://www.npmjs.com/package/body-parser   |                                                   |
| cors          | 2.8.5   | https://www.npmjs.com/package/cors          |                                                   |
| express       | 4.18.1  | https://www.npmjs.com/package/express       | https://expressjs.com/en/starter/hello-world.html |
| jsonwebtoken  | 8.5.1   | https://www.npmjs.com/package/jsonwebtoken  | https://github.com/auth0/node-jsonwebtoken        |
| pino          | 8.1.0   | https://www.npmjs.com/package/pino          | https://github.com/pinojs/pino                    |

### Depedencias de desarrollo 🗃️

| Paquete                 | Versión   | Página NPM                                            | Página Documentación                                                        |
|-------------------------|-----------|-------------------------------------------------------|-----------------------------------------------------------------------------|
| @cucumber/cucumber      | 8.4.0     | https://www.npmjs.com/package/@cucumber/cucumber      | https://github.com/cucumber/cucumber-js                                     |
| artillery               | 2.0.0-21  | https://www.npmjs.com/package/artillery               | https://www.artillery.io/docs                                               |
| artillery-plugin-expect | 2.0.1     | https://www.npmjs.com/package/artillery-plugin-expect | https://www.artillery.io/docs/guides/plugins/plugin-expectations-assertions |
| chai                    | 4.3.6     | https://www.npmjs.com/package/chai                    | https://www.chaijs.com                                                      |
| mocha                   | 10.0.0    | https://www.npmjs.com/package/mocha                   | https://mochajs.org                                                         |
| nodemon                 | 2.0.19    | https://www.npmjs.com/package/nodemon                 | https://github.com/remy/nodemon#nodemon                                     |
| nyc                     | 15.1.0    | https://www.npmjs.com/package/nyc                     | https://github.com/istanbuljs/nyc                                           |
| supertest               | 6.2.4     | https://www.npmjs.com/package/supertest               | https://github.com/visionmedia/supertest                                    |

## Contribuyendo 🤝

Por favor lee el [CONTRIBUTING](CONTRIBUTING.md) para detalles de nuestro código de conducta, y el proceso para enviarnos pull requests.

## Wiki 📖

Puedes encontrar mucho más de cómo utilizar este proyecto en nuestra [Wiki](https://github.com/byron-villegas-moya/node-express/wiki)

## Medallas 🥇

Usamos [Shields](https://shields.io/) para la generación de las medallas.

## Versionado 📌

Usamos [SemVer](https://semver.org/) para el versionado. Para todas las versiones disponibles, mira los [tags en este repositorio](https://github.com/byron-villegas-moya/node-express/tags).

## Autores ✒️

_Menciona a todos aquellos que ayudaron a levantar el proyecto desde sus inicios_

- **Byron Villegas Moya** - *Desarrollador* - [byron-villegas-moya](https://github.com/byron-villegas)

También puedes mirar la lista de todos los [contribuyentes](https://github.com/byron-villegas-moya/node-express/graphs/contributors) quíenes han participado en este proyecto. 

## Licencia 📄

Este proyecto está bajo la Licencia (MIT) - mira el archivo [LICENSE](LICENSE) para detalles
