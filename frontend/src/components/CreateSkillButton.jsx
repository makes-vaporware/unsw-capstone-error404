import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useCreateSkillMutation } from '../features/skills/skillsApiSlice';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  border: '2px solid #000',
  boxShadow: 24,
  backgroundColor: "#6d6d6d",
  p: 4,
};

const skillSources = ["user entry"]
export default function CreateSkillButton() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [createSkill] = useCreateSkillMutation();
  const [skillName, setSkillName] = React.useState("");
  const [skillDesc, setSkillDesc] = React.useState("");
  const [skillSource, setSkillSource] = React.useState(skillSources[0]);

  const handleSubmit = (e) => {
    createSkill({name: skillName,
      summary: skillDesc,
      source: skillSource
    })
    setOpen(false);
  };

  const menuItems = skillSources.map((s, i) => {
    return (
      <MenuItem value={s} key={i}>
        {`${s}`}
      </MenuItem>
    );
  });

  return (
    <div>
      <button className='button--secondary' onClick={handleOpen}>Create a skill</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={style}>
          <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Create Skill
            </Typography>
            <TextField
              variant="standard"
              label="Skill Name"
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
            />
            <TextField
              variant="standard"
              label="Skill Description"
              value={skillDesc}
              onChange={(event) => setSkillDesc(event.target.value)}
            />
            <Select
              id="select-skill-source"
              value={skillSource}
              onChange={(event) => setSkillSource(event.target.value)}
            >
              {menuItems}
            </Select>
            <button className='button--primary' onClick={handleSubmit}>Submit</button>
          </FormControl>

          
        </Box>
      </Modal>
    </div>
  );
}