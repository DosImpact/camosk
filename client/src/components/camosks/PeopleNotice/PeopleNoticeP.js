import React, { useState, useEffect } from 'react'
import styled from "styled-components";

function PeopleNoticeP({ className, ...props }) {
    const [clock, setPeopleNotice] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() => setPeopleNotice(new Date()), 1000)
        return () => clearInterval(timer)
    })
    return (
        <Wrapper className={className}>
            <div className="container">
                <div className="Date">{clock.toLocaleDateString().substr(0, 11)}</div>
                <div className="TikTok">{clock.toLocaleTimeString()}</div>
            </div>
        </Wrapper>
    )
}

export default PeopleNoticeP

const Wrapper = styled.div`
    /* min-width:100px; */
    /* max-width:50%; */
    
    .container{
        display: flex;
        flex-flow: column nowrap;
        justify-content:center;
        padding:10px;
        font-weight: 300;
        text-align:center;
        .Date{
            font-size:48px;
            margin-bottom:10px;
        }
        .TikTok{
            font-size:50px;
       
        }
    
    }
   
`;
