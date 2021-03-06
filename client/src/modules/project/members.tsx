import React from 'react';
import { Table, Button, Icon, Modal, Select, message } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { StringUtil } from '../../utils/string_util';
import EditableCell from '../../components/editable_cell';
import * as ReactDOM from 'react-dom';

interface Member {

    id: string;

    email: string;

    name: string;

    localhostMappingId: string;

    localhost: string;

    isOwner: boolean;
}

interface MembersProps {

    activeProject: string;

    isOwner: boolean;

    members: Member[];

    removeUser(projectId: string, userId: string);

    invite(projectId: string, emails: string[]);

    changeLocalhost(id: string, projectId: string, userId: string, ip: string);
}

interface MembersState {

    isInviteDlgOpen: boolean;

    inviteEmails: string[];
}

class MemberTable extends Table<Member> { }

class MemberColumn extends Table.Column<Member> { }

class Members extends React.Component<MembersProps, MembersState> {

    private inviteEmailInput: Select;

    constructor(props: MembersProps) {
        super(props);
        this.state = {
            isInviteDlgOpen: false,
            inviteEmails: []
        };
    }

    private removeUser = (member: Member) => {
        confirmDlg(
            'user',
            () => this.props.removeUser(this.props.activeProject, member.id),
            'remove',
            member.name
        );
    }

    private clickInviteBtn = () => {
        this.setState({ ...this.state, isInviteDlgOpen: true }, () => this.inviteEmailInputDom && this.inviteEmailInputDom.focus());
    }

    private get inviteEmailInputDom() {
        if (this.inviteEmailInput) {
            return ReactDOM.findDOMNode(this.inviteEmailInput).getElementsByTagName('input')[0] as HTMLInputElement;
        }
        return undefined;
    }

    private inviteMember = () => {
        const invite = () => {
            const result = StringUtil.checkEmails(this.state.inviteEmails);
            if (!result.success) {
                message.warning(result.message, 3);
                return;
            }
            this.props.invite(this.props.activeProject, this.state.inviteEmails);
            this.setState({ ...this.state, isInviteDlgOpen: false });
        };
        if (this.inviteEmailInputDom && !!this.inviteEmailInputDom.defaultValue) {
            this.setState({ ...this.state, inviteEmails: [...this.state.inviteEmails, this.inviteEmailInputDom.defaultValue] }, invite);
        } else {
            invite();
        }
    }

    private inviteEmailsChanged = (value) => {
        this.setState({ ...this.state, inviteEmails: value });
    }

    private changeLocalhost = (id: string, userId: string, oldIp: string, newIp: string) => {
        if (!!id && newIp === oldIp) {
            return;
        }
        const { changeLocalhost, activeProject } = this.props;
        changeLocalhost(id, activeProject, userId, newIp);
    }

    public render() {
        return (
            <div>
                <div className="project-title">Members
                    <Button
                        className="project-create-btn"
                        type="primary"
                        size="small"
                        icon="user-add"
                        ghost={true}
                        onClick={this.clickInviteBtn}
                    >
                        Invite Members
                    </Button>
                </div>
                <MemberTable
                    className="project-table project-members"
                    bordered={true}
                    size="middle"
                    rowKey="email"
                    dataSource={this.props.members}
                    pagination={false}
                >
                    <MemberColumn
                        title="Name"
                        dataIndex="name"
                        key="name"
                    />
                    <MemberColumn
                        title="Email"
                        dataIndex="email"
                        key="email"
                    />
                    <MemberColumn
                        title="Localhost"
                        dataIndex="localhost"
                        key="localhost"
                        width={170}
                        render={
                            (text, record, index) => (
                                <EditableCell
                                    content={text}
                                    onChange={(newText) => this.changeLocalhost(record.localhostMappingId, record.id, text, newText)}
                                />
                            )
                        }
                    />
                    <MemberColumn
                        title="IsOwner"
                        dataIndex="isOwner"
                        key="isOwner"
                        width={120}
                        render={(text, record) => (<Icon type={record.isOwner ? 'check' : ''} />)}
                    />
                    {
                        this.props.isOwner ? (
                            <MemberColumn
                                title="Action"
                                key="action"
                                width={240}
                                render={(text, record) =>
                                    record.isOwner ? '' :
                                        (
                                            <span>
                                                <a
                                                    href="#"
                                                    onClick={() => this.removeUser(record)}>
                                                    Delete
                                                </a>
                                            </span>
                                        )
                                }
                            />
                        ) : ''
                    }
                </MemberTable>
                <Modal title="Invite members"
                    visible={this.state.isInviteDlgOpen}
                    onCancel={() => this.setState({ ...this.state, isInviteDlgOpen: false })}
                    okText="Invite"
                    cancelText="Cancel"
                    onOk={this.inviteMember}
                >
                    <div style={{ marginBottom: '8px' }}>Please input members' emails split with ';':</div>
                    <Select
                        ref={ele => this.inviteEmailInput = ele}
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="sample@hitchhiker.com;"
                        value={this.state.inviteEmails}
                        onChange={this.inviteEmailsChanged}
                        tokenSeparators={[';']}
                        dropdownStyle={{ display: 'none' }}
                    />
                </Modal>
            </div>
        );
    }
}

export default Members;
