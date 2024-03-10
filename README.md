# Rip Template Generator

An embeddable HTML form and JSON API for generating wiki article rip templates from video URLs or IDs.

### HTML Embedding

The rip template generator can be embedded into web pages with an iframe element:

```
<iframe id="ripTemplateGenerator"
  title="Rip Template Generator"
  style="height: 100%; width: 100%; border: none;"
  src="https://generator.siivagunnerdatabase.net">
</iframe>
```

### API Usage

The API accepts GET requests and does not require any authentication or API key. `/api` does not accept any parameters. `/api/rip` accepts two parameters:

| Parameter | Description |
| --------- | ----------- |
| id        | Required. Accepts any public YouTube video URL or ID. For example, "NzoneDE0A2o". |
| spacing   | Optional. Accepts "single", "double", "tab", or "none". Defaults to "single". |

Example API call:

```
GET https://generator.siivagunnerdatabase.net/api/rip?id=NzoneDE0A2o
{
  "status": "success",
  "template": "{{Rip\n|image= Fire Emblem.jpg\n\n|link= NzoneDE0A2o\n|playlist= Fire Emblem\n|playlist id= PLL0CQjrcN8D1CYB8alWM5bax6yGk83dZ8\n|upload= April 7, 2018\n|length= 3:24\n|author= \n\n|album= \n|track= \n\n|music= The Inn\n|composer= Yuka Tsujiyoko\n|platform= Game Boy Advance\n|catchphrase= Go-Go Gadget Channel Description!\n}}\n\"'''The Inn - Fire Emblem'''\" is a high quality rip of \"The Inn\" from ''Fire Emblem''.\n== Jokes ==",
  "thumbnail": "https://i.ytimg.com/vi/NzoneDE0A2o/maxresdefault.jpg"
}
```

### Local Development

Requires [Node.js](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Use the following commands to install the dependencies and start the application:

```
npm install
npm start
```

### External Links

* [Template Generator Production Environment](https://generator.siivagunnerdatabase.net/)

* [Template Generator Development Environment](https://dev.generator.siivagunnerdatabase.net/)

* [SiIvaGunner Database Template Generator Page](https://siivagunnerdatabase.net/generate/)

* [Google Sites Template Generator Page](https://sites.google.com/view/rip-template-generator/home)

* [SiIvaGunner Wiki](https://siivagunner.fandom.com/wiki/SiIvaGunner_Wiki)
