

interface IconProps {
    width?: number
    height?: number
    classname?: string
    onClick?: () => void
    fill?: string
    stroke: string
}

export const RecordCircleIcon = ({width=32, height=32, classname='', onClick=()=>{}, fill='FF8A65'} : IconProps) => {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" onClick={() => onClick()} className={`${classname}`} width={width} height={height} viewBox="0 0 24 24" fill={fill}>
            <path d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm.03 14.23c-2.34 0-4.23-1.89-4.23-4.23 0-2.34 1.89-4.23 4.23-4.23 2.34 0 4.23 1.89 4.23 4.23 0 2.34-1.89 4.23-4.23 4.23Z" fill={fill}></path>
        </svg>
    )
}


export const MessageIcon = ({width=32, height=32, classname='', onClick=()=>{}, fill='FF8A65', stroke=''} : IconProps) => {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={` ${classname}`} viewBox="0 0 24 24" fill="none">
            <path d="M8.5 19H8c-4 0-6-1-6-6V8c0-4 2-6 6-6h8c4 0 6 2 6 6v5c0 4-2 6-6 6h-.5c-.31 0-.61.15-.8.4l-1.5 2c-.66.88-1.74.88-2.4 0l-1.5-2c-.16-.22-.53-.4-.8-.4Z" stroke={stroke} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M15.996 11h.01M11.995 11h.01M7.995 11h.008" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}