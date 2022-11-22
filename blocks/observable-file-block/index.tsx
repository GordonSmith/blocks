import React from "react";
import { Box, ToggleSwitch } from "@primer/react";
import { FileBlockProps, getLanguageFromFilename } from "@githubnext/blocks";
import { compile, omd2notebook, ojs2notebook } from "@hpcc-js/observablehq-compiler";
import { Runtime, Inspector } from "@observablehq/runtime";

import "@hpcc-js/observablehq-compiler/dist/index.css";

export default function (props: FileBlockProps) {
    const { block, context, content, metadata, onUpdateMetadata } = props;
    const language = Boolean(context.path) ? getLanguageFromFilename(context.path) : "N/A";
    const [isOn, setIsOn] = React.useState(true)

    const notebookRef = React.useRef(null);

    React.useEffect(() => {
        if (isOn && notebookRef.current) {
            let rawNotebook;
            if (context.path.indexOf(".ojs") === context.path.length - 4) {
                rawNotebook = ojs2notebook(content);
            } else if (context.path.indexOf(".omd") === context.path.length - 4) {
                rawNotebook = omd2notebook(content);
            } else if (context.path.indexOf(".ojsnb") === context.path.length - 6) {
                rawNotebook = JSON.parse(content);
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
    }, [language, content, isOn, notebookRef.current]);

    const onClick = () => {
        setIsOn(!isOn)
    }

    return <>
        <Box bg="canvas.subtle" marginTop={3} p={3} borderWidth={1} borderStyle="solid" borderColor="border.default">
            <Box display="flex" maxWidth="90%">
                <ToggleSwitch checked={isOn} onClick={onClick} aria-labelledby="switchLabel" />&nbsp;&nbsp;-&nbsp;&nbsp;<b>{isOn ? "ObservableJS" : "Source"}:</b>&nbsp;&nbsp;{context.path}
            </Box>
        </Box>
        {isOn ?
            <div ref={notebookRef}></div> :
            <pre className="mt-3 p-3">{content}</pre>
        }
    </>;


    // <Box p={4}>
    //     <Box display="flex" maxWidth="300px">
    //         <Box flexGrow={1} fontSize={2} fontWeight="bold" id="switchLabel">
    //             Notifications
    //         </Box>
    //         <ToggleSwitch defaultChecked aria-labelledby="switchLabel" />
    //     </Box>
    // </Box>;
}