import React from "react";
import { Box, ToggleSwitch } from "@primer/react";
import { FileBlockProps, getLanguageFromFilename } from "@githubnext/blocks";
import { compile, omd2notebook, ojs2notebook } from "@hpcc-js/observablehq-compiler";
import { Runtime, Inspector } from "@observablehq/runtime";

import "@hpcc-js/observablehq-compiler/dist/index.css";

export default function (props: FileBlockProps) {
    const { block, context, metadata, onUpdateMetadata } = props;
    const language = Boolean(context.path) ? getLanguageFromFilename(context.path) : "N/A";
    const [isOn, setIsOn] = React.useState(true)

    const notebookRef = React.useRef(null);

    React.useEffect(() => {
        if (isOn && notebookRef.current) {
            let rawNotebook;
            if ((context.path.indexOf(".csv") === context.path.length - 4) ||
                (context.path.indexOf(".json") === context.path.length - 5) ||
                (context.path.indexOf(".parquet") === context.path.length - 8)) {
                const path = `https://raw.githubusercontent.com/${context.owner}/${context.repo}/${context.sha}/${context.path}`
                const parts = path.split(".");
                parts.pop();
                const name = parts.join(".");
                rawNotebook = ojs2notebook(`\
import { viewof tableSummary, viewof jsQueryEditor } with { myData as data } from "@randomfractals/duckdb-data-tables";
import {DuckDBClient} from '@cmudig/duckdb'

viewof tableSummary;

viewof searchResults = Inputs.search(myData);
Inputs.table(searchResults);
md\`
## Data Wrangler

Query and transform DuckDB **${context.path}** data with [Arquero](https://uwdata.github.io/arquero/) in Observable [Data Wrangler](https://observablehq.com/@observablehq/data-wrangler) cell with auto-generated JS data transformations code:\`
viewof jsQueryEditor;

md\`-- - \`;

file = FileAttachment("${path}");

db = DuckDBClient.of([file])

myData = db.sql([\`SELECT * FROM '${name}'\`]);
`);
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