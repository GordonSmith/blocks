import React from "react";
import { FileBlockProps, getLanguageFromFilename } from "@githubnext/blocks";
import { compile, ohq } from "@hpcc-js/observablehq-compiler";
import { Runtime, Inspector } from "@observablehq/runtime";

import "@hpcc-js/observablehq-compiler/dist/index.css";

export default function (props: FileBlockProps) {
    const { block, context, metadata, onUpdateMetadata } = props;
    const language = Boolean(context.path) ? getLanguageFromFilename(context.path) : "N/A";
    const [isOn, setIsOn] = React.useState(true)

    const notebookRef = React.useRef(null);

    React.useEffect(() => {
        if (isOn && notebookRef.current) {
            let mime_type: string | undefined;
            let rawNotebook: ohq.Notebook | undefined;
            if (context.path.indexOf(".csv") === context.path.length - 4) {
                mime_type = "text/csv"
            } else if (context.path.indexOf(".json") === context.path.length - 5) {
                mime_type = "application/json"
            } else if (context.path.indexOf(".parquet") === context.path.length - 8) {
                mime_type = "application/octet-stream"
            }
            if (mime_type) {
                const ghUrl = `https://github.com/${context.owner}/${context.repo}/blob/${context.sha}/${context.path}`
                const url = `https://raw.githubusercontent.com/${context.owner}/${context.repo}/${context.sha}/${context.path}`
                const name = context.file;
                rawNotebook = {
                    files: [{
                        name,
                        url,
                        mime_type
                    }],
                    nodes: [{
                        id: 0,
                        mode: "md",
                        value: `\
## Data Preview [${context.path}](${ghUrl})
_Collection of insights and tools for your data_
`
                    }, {
                        id: 10,
                        mode: "js",
                        value: `\
md\`---
### Columns
\`
db.describe(table);
`
                    }, {
                        id: 100,
                        mode: "js",
                        value: `\
md\`---
### Field Summary
\`
viewof tableSummary = SummaryTable(myData, {label: table});
`
                    }, {
                        id: 200,
                        mode: "js",
                        value: `\
md\`---
### Quick Filter
\`
viewof searchResults = Inputs.search(myData);
Inputs.table(searchResults);
`
                    }, {
                        id: 300,
                        mode: "js",
                        value: `\
md\`---
### Data Wrangler
\`;
viewof wrangler = Wrangler(myData);
// jsQueryEditor.update_wrapper_value(\`\`);
// aq.from(myData).groupby('location').rollup({mean:d => op.mean(d['precipitation']), count: d => op.count()})
`
                    }, {
                        id: 999,
                        mode: "js",
                        value: `\
md\`---
### TODO V6:  Hide debug info
\`;
import {DuckDBClient} from '@cmudig/duckdb'
import {Wrangler} from '@observablehq/data-wrangler'
import { aq, op } from "@uwdata/arquero"
import {SummaryTable} from '@observablehq/summary-table'

file = FileAttachment("${name}");

db = DuckDBClient.of([file])

tables = db.describeTables();

table = tables[0].name;

myData = db.sql([\`SELECT * FROM '${name}'\`]);
`
                    }]
                };
            }

            if (rawNotebook) {
                compile(rawNotebook)
                    .then(nb => {
                        new Runtime().module(nb, Inspector.into(notebookRef.current));
                    })
                    .catch(e => { })
                    ;
            }
        }
    }, [block, language, isOn, notebookRef.current]);

    const onClick = () => {
        setIsOn(!isOn)
    }

    return <>
        <div ref={notebookRef}></div>
    </>;
}