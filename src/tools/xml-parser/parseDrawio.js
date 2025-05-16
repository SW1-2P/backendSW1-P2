// tools/xml-parser/parseDrawio.js
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

const INPUT_FILE = 'formulario.drawio'; // el XML que exportas desde draw.io
const OUTPUT_FILE = 'output.json';      // JSON con los campos del formulario

fs.readFile(INPUT_FILE, 'utf-8', (err, data) => {
  if (err) throw err;

  parser.parseString(data, (err, result) => {
    if (err) throw err;

    const cells = result.mxfile.diagram.mxGraphModel.root.mxCell;
    const formElements = [];

    cells.forEach(cell => {
      if (cell.$?.value && cell.$?.style) {
        const label = cell.$.value.trim();
        const style = cell.$.style;

        if (style.includes('shape=mxgraph.bootstrap.rrect')) {
          formElements.push({
            type: 'input',
            label,
            formControl: label
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^\w_]/g, '')
          });
        } else if (
          style.includes('fillColor=#0057D8') || 
          style.includes('shape=mxgraph.mockup.buttons')
        ) {
          formElements.push({
            type: 'button',
            label
          });
        }
      }
    });

    const output = {
      interfaces: [
        {
          name: 'formularioGenerado',
          components: formElements
        }
      ]
    };

    fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), err => {
      if (err) throw err;
      console.log(`✅ Archivo JSON generado en ${OUTPUT_FILE}`);
    });
  });
});
