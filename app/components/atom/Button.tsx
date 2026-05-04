import {ReactNode} from "react";
import { Button as AntButton } from 'antd';

interface ButtonProps {
    onClick: () => void,
    icon?: ReactNode,
    className?: string
}

export const Button = ({ onClick, icon, className } : ButtonProps) => {
    return (
        <AntButton className={`text-green-400 hover:text-green-300 cursor-pointer ${className}`} onClick={onClick}>
            {
                icon ? icon : undefined
            }
        </AntButton>
    )
}