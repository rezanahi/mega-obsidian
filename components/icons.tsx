

interface IconProps {
    width?: number
    height?: number
    classname?: string
    onClick?: () => void
    fill?: string
}

export const RecordCircleIcon = ({width=32, height=32, classname='', onClick=()=>{}, fill='FF8A65'} : IconProps) => {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" onClick={() => onClick()} className={`${classname}`} width={width} height={height} viewBox="0 0 24 24" fill={fill}>
            <path d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm.03 14.23c-2.34 0-4.23-1.89-4.23-4.23 0-2.34 1.89-4.23 4.23-4.23 2.34 0 4.23 1.89 4.23 4.23 0 2.34-1.89 4.23-4.23 4.23Z" fill={fill}></path>
        </svg>
    )
}