/**
 * BESTO Design Plugin
 * 기존 UI 코드를 MIDAS Pyscript 템플릿에 통합
 */

import React, { useState } from 'react';
import './App.css';
import { checkPyScriptReady } from './utils_pyscript';
import DetailDialog from './components/DetailDialog';
import DesignDialog from './components/DesignDialog';
import SectionList from './components/SectionList';
import SearchForm from './components/SearchForm';
import { SectionData, DetailResult, SearchInputs, DesignInputs } from './types';

const App = () => {
  // Section List 상태
  const [sectionList, setSectionList] = useState<SectionData[]>([]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  // 상세 계산 결과 저장 (인덱스별로 저장)
  const [detailedResults, setDetailedResults] = useState<Map<number, DetailResult>>(new Map());

  // 마지막으로 사용된 검색 입력값 저장
  const [lastSearchInputs, setLastSearchInputs] = useState<SearchInputs | null>(null);

  // 팝업 상태
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDesignDialogOpen, setIsDesignDialogOpen] = useState(false);

  // Search Satisfied Section 버튼 핸들러
  const handleSearch = async (inputs: SearchInputs) => {
    setLastSearchInputs(inputs);
    const { selectedMember } = inputs;

    try {
      // 1. Python 함수를 호출하여 선택된 부재 주변 5개 부재 리스트 가져오기
      const neighborBeamsResult = await new Promise<string[]>((resolve, reject) => {
        checkPyScriptReady(() => {
          try {
            const pyFunc = pyscript.interpreter.globals.get('get_neighbor_h_beams');
            if (pyFunc) {
              const resultStr = pyFunc(selectedMember);
              const result = JSON.parse(resultStr);
              if (result.error) {
                reject(new Error(result.error));
              } else {
                resolve(result);
              }
            } else {
              reject(new Error('Python function get_neighbor_h_beams not found'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      // 2. Python 함수에 전달할 기본 입력 데이터 준비
      const basePythonInput = {
        rebar_top_count: inputs.rebarTopCount,
        rebar_top_dia: inputs.rebarTopDia,
        rebar_bot_count: inputs.rebarBotCount,
        rebar_bot_dia: inputs.rebarBotDia,
        rebar_yield_stress: inputs.fYr,
        stud_spacing: inputs.studSpacing,
        angle_spacing: inputs.angleSpacing,
        steelU: inputs.fYU || undefined,
        steelH: inputs.fYH || undefined,
        concrete: inputs.concrete,
        slabDs: inputs.slabDs,
        beamSupport: inputs.support === '미사용' ? '0' : '1',
      };

      // 3. 각 부재에 대해 계산 수행
      const sectionDataList: SectionData[] = [];
      const newDetailedResults = new Map<number, DetailResult>();

      for (const member of neighborBeamsResult) {
        try {
          const pythonInput = {
            ...basePythonInput,
            selectedMember: member,
          };

          // Python 함수 호출
          const result = await new Promise<DetailResult>((resolve, reject) => {
            checkPyScriptReady(() => {
              try {
                const pyFunc = pyscript.interpreter.globals.get('calculate_design_strength');
                if (pyFunc) {
                  const resultStr = pyFunc(JSON.stringify(pythonInput));
                  const result = JSON.parse(resultStr);
                  resolve(result);
                } else {
                  reject(new Error('Python function calculate_design_strength not found'));
                }
              } catch (error) {
                reject(error);
              }
            });
          });

          // 에러 체크
          if (result.error) {
            console.error(`부재 ${member} 계산 오류:`, result.error);
            continue;
          }

          // 결과 데이터 구성 및 리스트 추가
          const sectionData = createSectionData(result, member);
          sectionDataList.push(sectionData);
          newDetailedResults.set(sectionDataList.length - 1, result);

        } catch (error) {
          console.error(`부재 ${member} 처리 중 오류:`, error);
        }
      }

      setSectionList(sectionDataList);
      setDetailedResults(newDetailedResults);

    } catch (error) {
      console.error('계산 중 오류가 발생했습니다:', error);
      alert(`계산 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 계산 결과로부터 SectionData 객체 생성 라이브러리 함수
  const createSectionData = (result: DetailResult, member: string): SectionData => {
    const calcRatio = (required: number | undefined, design: number | undefined): number => {
      if (!design || design === 0) return 0;
      const ratio = required ? required / design : 0;
      return Math.round(ratio * 100) / 100;
    };

    const calcDeflectionRatio = (design: number | undefined, required: number | undefined): number => {
      if (!required || required === 0) return 0;
      const ratio = design ? design / required : 0;
      return Math.round(ratio * 100) / 100;
    };

    const checkResult = result.checkResult || {};
    const allChecksPassed = Object.values(checkResult).every((value) => value === true);
    const chkStatus = allChecksPassed ? 'OK' : 'NG';

    return {
      section: `${result.sectionInfo?.hSection || member}\n${result.sectionInfo?.uSection || ''}`,
      hArea: result.sectionInfo?.hArea,
      uArea: result.sectionInfo?.uArea,
      chk: chkStatus,
      selected: false,
      beforeComposite: {
        mEnd: calcRatio(result.constructionStage?.H_negative?.requiredStrength, result.constructionStage?.H_negative?.designStrength),
        mMid: calcRatio(result.constructionStage?.U_positive?.requiredStrength, result.constructionStage?.U_positive?.designStrength),
        v: calcRatio(result.constructionStage?.U_shear?.requiredStrength, result.constructionStage?.U_shear?.designStrength),
      },
      afterComposite: {
        mEnd: calcRatio(result.compositeStage?.H_negative?.requiredStrength, result.compositeStage?.H_negative?.designStrength),
        mMid: calcRatio(result.compositeStage?.U_positive?.requiredStrength, result.compositeStage?.U_positive?.designStrength),
        v: calcDeflectionRatio(result.compositeStage?.deflection?.deflectionDeadLive, result.compositeStage?.deflection?.deflectionDeadLiveLimit),
      },
    };
  };

  // 섹션 선택 핸들러
  const handleSectionSelect = (index: number) => {
    setSelectedSectionIndex(index);
    setSectionList(prev =>
      prev.map((item, i) => ({
        ...item,
        selected: i === index,
      }))
    );
  };

  // Design 버튼 핸들러
  const handleDesign = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLButtonElement).blur();
    if (selectedSectionIndex !== null) {
      setIsDesignDialogOpen(true);
    } else {
      alert('섹션을 먼저 선택해주세요.');
    }
  };

  const handleDesignDone = async (designInputs: DesignInputs) => {
    if (selectedSectionIndex === null || !lastSearchInputs) return;

    try {
      // 선택된 부재의 이름을 가져오거나 없으면 Custom으로 표시
      const member = sectionList[selectedSectionIndex].section.split('\n')[0];

      const pythonInput = {
        ...lastSearchInputs,
        rebar_top_count: lastSearchInputs.rebarTopCount,
        rebar_top_dia: lastSearchInputs.rebarTopDia,
        rebar_bot_count: lastSearchInputs.rebarBotCount,
        rebar_bot_dia: lastSearchInputs.rebarBotDia,
        rebar_yield_stress: lastSearchInputs.fYr,
        stud_spacing: lastSearchInputs.studSpacing,
        angle_spacing: lastSearchInputs.angleSpacing,
        steelU: lastSearchInputs.fYU || undefined,
        steelH: lastSearchInputs.fYH || undefined,
        concrete: lastSearchInputs.concrete,
        slabDs: lastSearchInputs.slabDs,
        beamSupport: lastSearchInputs.support === '미사용' ? '0' : '1',
        selectedMember: member,
        ...designInputs // 커스텀 치수
      };

      // Python 함수 호출
      const result = await new Promise<DetailResult>((resolve, reject) => {
        checkPyScriptReady(() => {
          try {
            const pyFunc = pyscript.interpreter.globals.get('calculate_design_strength');
            if (pyFunc) {
              const resultStr = pyFunc(JSON.stringify(pythonInput));
              const result = JSON.parse(resultStr);
              resolve(result);
            } else {
              reject(new Error('Python function calculate_design_strength not found'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      if (result.error) {
        alert(`계산 오류: ${result.error}`);
        return;
      }

      // 결과 업데이트 (User 요청: (Custom) 삭제 및 변경된 치수 반영)
      const updatedSectionData = createSectionData(result, member);
      updatedSectionData.selected = true;

      const newHName = `H-${designInputs.h_height}X${designInputs.h_width}X${designInputs.h_t1}X${designInputs.h_t2}`;
      const newUName = `U-${designInputs.u_height}X${designInputs.u_width}X${designInputs.u_thickness}`;
      updatedSectionData.section = `${newHName}\n${newUName}`;

      setSectionList(prev => {
        const newList = [...prev];
        newList[selectedSectionIndex] = updatedSectionData;
        return newList;
      });

      setDetailedResults(prev => {
        const newMap = new Map(prev);
        newMap.set(selectedSectionIndex, result);
        return newMap;
      });

    } catch (error) {
      console.error('커스텀 계산 중 오류:', error);
      alert('계산 중 오류가 발생했습니다.');
    }
  };

  // Change 버튼 핸들러
  const handleChange = () => {
    if (selectedSectionIndex !== null) {
      alert(`선택된 섹션: ${sectionList[selectedSectionIndex].section.replace('\n', ' / ')}\n마이다스 연동 시 해당 부재가 변경됩니다.`);
    } else {
      alert('섹션을 먼저 선택해주세요.');
    }
  };

  // Detail 버튼 핸들러
  const handleDetail = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLButtonElement).blur();
    if (selectedSectionIndex !== null) {
      setIsDetailDialogOpen(true);
    } else {
      alert('섹션을 먼저 선택해주세요.');
    }
  };

  // Close 버튼 핸들러
  const handleClose = () => {
    alert('플러그인을 종료합니다.');
  };

  // DesignDialog 초기 데이터 계산
  const getDesignInitialData = (): DesignInputs => {
    if (selectedSectionIndex !== null) {
      const data = detailedResults.get(selectedSectionIndex);
      if (data?.sectionInfo) {
        // H형강 치수 추출 (단면 이름에서 파싱하거나 result에서 가져옴)
        // 현재 result.sectionInfo에는 hArea 등은 있지만 상세 치수(H, B 등)는 parsedInputs에 있음
        const pi = (data as any).parsedInputs;
        if (pi) {
          return {
            h_height: String(pi.hSection.height),
            h_width: String(pi.hSection.width),
            h_t1: String(pi.hSection.webThickness),
            h_t2: String(pi.hSection.flangeThickness),
            h_bracket_length: String(pi.hSection.bracketLength || ''),
            u_height: String(pi.uSection.height),
            u_width: String(pi.uSection.width),
            u_thickness: String(pi.uSection.thickness),
          };
        }
      }
    }
    return {
      h_height: '600', h_width: '200', h_t1: '11', h_t2: '17',
      u_height: '400', u_width: '250', u_thickness: '6'
    };
  };

  return (
    <div className="plugin-container">
      <SearchForm onSearch={handleSearch} />

      <SectionList
        sections={sectionList}
        onSelect={handleSectionSelect}
      />

      {/* Bottom Buttons */}
      <div className="bottom-buttons">
        <button className="action-button" onClick={handleDetail}>
          Detail...
        </button>
        <button className="action-button" onClick={handleDesign}>
          Design...
        </button>
        <button className="action-button" onClick={handleChange}>
          Change
        </button>
        <button className="action-button" onClick={handleClose}>
          Close
        </button>
      </div>

      <DetailDialog
        open={isDetailDialogOpen}
        setOpen={setIsDetailDialogOpen}
        title={`상세 계산 결과 - ${selectedSectionIndex !== null && sectionList[selectedSectionIndex] ? sectionList[selectedSectionIndex].section.split('\n')[0] : ''}`}
        data={selectedSectionIndex !== null ? detailedResults.get(selectedSectionIndex) : undefined}
      />

      <DesignDialog
        open={isDesignDialogOpen}
        setOpen={setIsDesignDialogOpen}
        initialData={getDesignInitialData()}
        onDone={handleDesignDone}
      />
    </div>
  );
};

export default App;
