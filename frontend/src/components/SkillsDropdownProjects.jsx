import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

import {
  useGetSkillsQuery,
} from "../features/skills/skillsApiSlice";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useAddSkillToProjectMutation, useRemoveSkillFromProjectMutation } from "../features/projects/projectsApiSlice";
import { PulseLoader } from "react-spinners";
import CreateSkillButton from "./CreateSkillButton";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const SkillsDropdownProjects = ({ project }) => {
  const errRef = React.useRef()

  const [selectedSkills, setSelectedSkills] = React.useState(project.requiredSkills);
  const [errMsg, setErrMsg] = React.useState('')

  const {
    data: skills,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
    error: getError,
  } = useGetSkillsQuery();

  const [addSkill, {
    isSuccess: isAddSuccess,
    isLoading: isAddLoading,
    isError: isAddError,
    error: addError
  }] = useAddSkillToProjectMutation();
  const [removeSkill, {
    isSuccess: isRemoveSuccess,
    isLoading: isRemoveLoading,
    isError: isRemoveError,
    error: removeError
  }] = useRemoveSkillFromProjectMutation();

  let menuItems = [];
  if (isGetSuccess) {
    menuItems = skills.ids.map((id, i) => {
      const skill = skills.entities[id];
      return (
        <MenuItem value={skill.id} key={i}>
          {`${skill.name} (${skill.source})`}
        </MenuItem>
      )
    })
  }

  React.useEffect(() => {
    if (isAddSuccess) setErrMsg('')
    if (isRemoveSuccess) setErrMsg('')
  }, [isAddSuccess, isRemoveSuccess])

  React.useEffect(() => {
    if (isAddError) {
      setErrMsg(addError?.data?.message)
      errRef.current.focus()
    }
  }, [isAddError])

  React.useEffect(() => {
    if (isRemoveError) {
      setErrMsg(removeError?.data?.message)
      errRef.current.focus()
    }
  }, [isRemoveError])

  let skillIds = [];
  if (isGetSuccess) {
    skillIds = skills.ids;
  }

  const handleSubmitSkills = (e) => {
    e.preventDefault();
    const newSkillset = new Set(selectedSkills);
    const oldSkillset = new Set(project.requiredSkills);
    for (let skillId of newSkillset.difference(oldSkillset)) {
      addSkill({ skillId: skillId, projectId: project.id });
    }
    for (let skillId of oldSkillset.difference(newSkillset)) {
      removeSkill({ skillId: skillId, projectId: project.id });
    }
  };

  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

  return (
    <div>
      {errMessage} <br/>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
        <Autocomplete
          multiple
          id="tags-standard"
          options={skillIds}
          disableCloseOnSelect
          getOptionLabel={(skillId) => skills ? skills.entities[skillId].name : skillId}
          value={selectedSkills}
          onChange={(event, newValue) => setSelectedSkills(newValue)}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {skills ? skills.entities[option].name : option}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Skills"
              sx={{ backgroundColor: "lightGrey", width: "400px" , borderRadius: "5px"}}
            />
          )}
        />
        <CreateSkillButton/>
        <button type="submit" onClick={handleSubmitSkills}>
          { (isAddLoading || isRemoveLoading) ? <PulseLoader /> : "Confirm Skills Changes" }
        </button>
      </FormControl>
    </div>
  );
}


export default SkillsDropdownProjects