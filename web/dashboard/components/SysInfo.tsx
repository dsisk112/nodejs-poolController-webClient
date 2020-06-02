import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, UncontrolledTooltip } from 'reactstrap';

import CustomCard from './CustomCard';
import DateTime from './DateTime';
import StatusIndicator from './StatusIndicator';
import SysInfoEditLogger from './SysInfoEditLogger';
import { PoolContext } from './PoolController';
import axios from 'axios';
const record=require('../images/record.gif');
interface Props {
    id: string,
    counter: number,
    data: any;
    isLoading: boolean
    doneLoading: boolean
    controllerName: string
}

const initialState: any={
    temps: {},
    status: {},
    mode: {},
    freeze: false,
    time: ''
};

function SysInfo(props: Props) {
    const [modalOpen, setModalOpen]=useState(false);
    const { controllerType, emitter, poolURL }=useContext(PoolContext);
    const [isRecording, setIsRecording]=useState();
    useEffect(() => {
        const fetch=async () => {
            let arr=[]
            arr.push(axios({
                method: 'GET',
                url: `${ poolURL }/app/config/log`
            }))
            let res=await axios.all(arr);
            setIsRecording(res[0].data.app.captureForReplay);
        }

        if (typeof poolURL !== 'undefined') fetch();
    }, [poolURL]);
    const toggleModal=() => {
        // open and close the modal
        setModalOpen(!modalOpen);
    }
    const dateParse = (date: any) => {
        var s = date.split(/[^0-9]/);
        return new Date(s[0], s[1] - 1, s[2], s[3], s[4], s[5]);
    }
    const closeBtn=<button className="close" onClick={toggleModal}>&times;</button>;
    return typeof props.data!=='string'&&typeof props.data!=='undefined'&&!props.isLoading&&props.doneLoading?
        (
            <div className="tab-pane active" id="system" role="tabpanel" aria-labelledby="system-tab">
                <CustomCard name='System Information' id={props.id} edit={toggleModal}>
                    <Row>
                        <Col xs="6">Controller Type </Col>
                        <Col>
                            {props.controllerName}
                            {isRecording&&<>
                                <img src={record} alt='Capture For Replay is recording' id='recordBtn' style={{width:'19px', marginLeft:'1rem'}}/>
                                <UncontrolledTooltip placement="right" target="recordBtn">
                                    Capture for replay is recording.
                                    </UncontrolledTooltip>
                            </>}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">Date/Time </Col>
                        <Col>
                            <DateTime origDateTime={dateParse(props.data.time)} />
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="6">Status</Col>
                        <Col xs="6"><StatusIndicator status={props.data.status} counter={props.counter}></StatusIndicator></Col>
                    </Row>
                    <Row>
                        <Col xs="6">Mode</Col>
                        <Col xs="6">{props.data.mode.desc}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Freeze</Col>
                        <Col xs="6">{props.data.freeze? "Active":"Off"}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Air Temp</Col>
                        <Col xs="6">{typeof props.data.temps==='undefined'? '':props.data.temps.air}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Solar Temp</Col>
                        <Col xs="6">{typeof props.data.temps==='undefined'? '':props.data.temps.solar}</Col>
                    </Row>

                </CustomCard>
                <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                    <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust App Settings</ModalHeader>
                    <ModalBody>
                        <SysInfoEditLogger setIsRecording={setIsRecording} />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
        :
        <>Loading...</>;

}

export default SysInfo;