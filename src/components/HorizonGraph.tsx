import {useEffect} from "preact/hooks";

export function HorizonGraph ({horizon, summer, winter}){
    function drawHorizon (solstice: string)  {
        const canvas = document.getElementById(solstice);
        const data = solstice === "summer" ? summer : winter;
        const ctx = canvas.getContext("2d");
        const offset = 100;
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.moveTo(0, offset-data[0]["altitude"]);
            for (let i = 0; i < data.length; i++) {
                ctx.lineTo(i * 8, offset-data[i]["altitude"]);
            }
            ctx.closePath()
            ctx.fillStyle= "yellow"
            ctx.fill()

            ctx.beginPath();
            ctx.moveTo(0, offset);
            for (let i = 0; i < horizon.length; i++) {
                ctx.lineTo(i * 8, offset-horizon[i]["horizon"]);
            }
            ctx.lineTo(horizon.length*8, offset);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "gray";
            ctx.stroke();
            ctx.closePath()
            ctx.fillStyle= "rgba(189, 195, 199, 1)"
            ctx.fill()

            ctx.beginPath();
            ctx.moveTo(0, offset-data[0]["altitude"]);
            for (let i = 0; i < data.length; i++) {
                ctx.lineTo(i * 8, offset-data[i]["altitude"]);
            }
            ctx.lineWidth = 2;
            ctx.strokeStyle = "orange";
            ctx.stroke();

        }
    };
    useEffect(()=>{
        drawHorizon("summer")
        drawHorizon("winter")
    },[summer, winter])

    return (<>
        <h4>Winter solstice</h4>
        <canvas width="380px" height="110px" id="winter" style="border:1px solid #000000;"/>
        <h4>Summer solstice</h4>
        <canvas width="380px" height="110px" id="summer" style="border:1px solid #000000;"/></>)
}